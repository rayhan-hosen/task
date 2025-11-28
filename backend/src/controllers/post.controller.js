const prisma = require('../db');

const createPost = async (req, res) => {
    try {
        const { content, imageUrl, privacy } = req.body;
        const userId = req.userId;

        if (!content && !imageUrl) {
            return res.status(400).json({ message: 'Post must contain text or image' });
        }

        const post = await prisma.post.create({
            data: {
                content,
                imageUrl,
                privacy: privacy || 'PUBLIC',
                authorId: userId,
            },
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });

        res.status(201).json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getFeed = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Fetch posts without likes to avoid N+1 query
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { privacy: 'PUBLIC' },
                    { authorId: userId }, // Own private posts
                ],
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true },
                },
                _count: {
                    select: { likes: true, comments: true },
                },
                comments: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: {
                            select: { id: true, firstName: true, lastName: true }
                        },
                        _count: {
                            select: { likes: true }
                        }
                    }
                },
            },
        });

        // Fetch ancestors for the latest comments
        let allComments = posts.flatMap(p => p.comments);
        let commentsToCheck = [...allComments];

        // Recursively fetch parents (up to 10 levels deep to prevent infinite loops)
        for (let i = 0; i < 10; i++) {
            const parentIds = commentsToCheck
                .filter(c => c.parentId)
                .map(c => c.parentId);

            if (parentIds.length === 0) break;

            // Fetch parents
            const parents = await prisma.comment.findMany({
                where: { id: { in: parentIds } },
                include: {
                    author: { select: { id: true, firstName: true, lastName: true } },
                    _count: { select: { likes: true } }
                }
            });

            if (parents.length === 0) break;

            allComments.push(...parents);
            commentsToCheck = parents;
        }

        // Fetch all likes for these posts in a single query
        const postIds = posts.map(p => p.id);
        const allPostLikes = await prisma.like.findMany({
            where: {
                postId: { in: postIds },
                commentId: null
            },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        });

        // Fetch all likes for these comments in a single query
        const commentIds = allComments.map(c => c.id);
        const allCommentLikes = await prisma.like.findMany({
            where: {
                commentId: { in: commentIds },
                postId: null
            },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        });

        // Group post likes by postId
        const likesByPost = {};
        allPostLikes.forEach(like => {
            if (!likesByPost[like.postId]) {
                likesByPost[like.postId] = [];
            }
            likesByPost[like.postId].push(like);
        });

        // Group comment likes by commentId
        const likesByComment = {};
        allCommentLikes.forEach(like => {
            if (!likesByComment[like.commentId]) {
                likesByComment[like.commentId] = [];
            }
            likesByComment[like.commentId].push(like);
        });

        // Add isLiked field and format likes for posts and their comments
        const postsWithData = posts.map(post => {
            const postLikes = likesByPost[post.id] || [];

            // Filter comments for this post
            const postComments = allComments.filter(c => c.postId === post.id);

            // Sort by createdAt ASC to build tree correctly
            postComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            // Process comments to add likes data
            const processedComments = postComments.map(comment => {
                const commentLikes = likesByComment[comment.id] || [];
                return {
                    ...comment,
                    likes: commentLikes,
                    isLiked: commentLikes.some(like => like.userId === userId),
                    likedBy: commentLikes.map(like => like.user),
                    replies: [] // Initialize replies
                };
            });

            // Build Tree
            const commentMap = {};
            const rootComments = [];

            processedComments.forEach(c => commentMap[c.id] = c);

            processedComments.forEach(comment => {
                if (comment.parentId && commentMap[comment.parentId]) {
                    commentMap[comment.parentId].replies.push(comment);
                } else {
                    rootComments.push(comment);
                }
            });

            return {
                ...post,
                likes: postLikes,
                isLiked: postLikes.some(like => like.userId === userId),
                likedBy: postLikes.map(like => like.user),
                comments: rootComments,
            };
        });

        res.json(postsWithData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId_commentId: {
                    userId,
                    postId: parseInt(postId),
                    commentId: 0, // Prisma composite key requirement workaround if needed, but actually schema says commentId is nullable. 
                    // However, unique constraint is on [userId, postId, commentId]. 
                    // If commentId is null, unique constraint might behave differently in some DBs, but in MySQL NULLs are distinct.
                    // Let's check how we handle this. 
                    // Actually, for the unique constraint `@@unique([userId, postId, commentId])`, if commentId is optional, 
                    // we should query carefully. 
                    // Better approach: findFirst where postId is set and commentId is null.
                },
            },
        });

        // Workaround: findFirst since unique constraint with NULLs can be tricky in Prisma findUnique depending on version/DB
        const like = await prisma.like.findFirst({
            where: {
                userId,
                postId: parseInt(postId),
                commentId: null
            }
        });

        if (like) {
            await prisma.like.delete({
                where: { id: like.id },
            });
            res.json({ message: 'Unliked', isLiked: false });
        } else {
            await prisma.like.create({
                data: {
                    userId,
                    postId: parseInt(postId),
                },
            });
            res.json({ message: 'Liked', isLiked: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const toggleCommentLike = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;

        const like = await prisma.like.findFirst({
            where: {
                userId,
                commentId: parseInt(commentId),
                postId: null
            }
        });

        if (like) {
            await prisma.like.delete({
                where: { id: like.id },
            });
            res.json({ message: 'Unliked', isLiked: false });
        } else {
            await prisma.like.create({
                data: {
                    userId,
                    commentId: parseInt(commentId),
                },
            });
            res.json({ message: 'Liked', isLiked: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, parentId } = req.body;
        const userId = req.userId;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId: parseInt(postId),
                authorId: userId,
                parentId: parentId ? parseInt(parentId) : null,
            },
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;

        // Fetch all comments for the post without likes to avoid N+1
        const comments = await prisma.comment.findMany({
            where: { postId: parseInt(postId) },
            include: {
                author: {
                    select: { id: true, firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Fetch all likes for these comments in a single query
        const commentIds = comments.map(c => c.id);
        const allLikes = await prisma.like.findMany({
            where: {
                commentId: { in: commentIds },
                postId: null
            },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        });

        // Group likes by commentId for efficient lookup
        const likesByComment = {};
        allLikes.forEach(like => {
            if (!likesByComment[like.commentId]) {
                likesByComment[like.commentId] = [];
            }
            likesByComment[like.commentId].push(like);
        });

        // Process comments to add isLiked and structure replies (same as before)
        const processedComments = comments.map(comment => {
            const commentLikes = likesByComment[comment.id] || [];
            return {
                ...comment,
                likes: commentLikes,
                isLiked: commentLikes.some(like => like.userId === userId),
                likedBy: commentLikes.map(like => like.user),
            };
        });

        // Build hierarchy (same as before)
        const commentMap = {};
        const rootComments = [];

        processedComments.forEach(comment => {
            comment.replies = [];
            commentMap[comment.id] = comment;
        });

        processedComments.forEach(comment => {
            if (comment.parentId) {
                if (commentMap[comment.parentId]) {
                    commentMap[comment.parentId].replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        res.json(rootComments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { createPost, getFeed, toggleLike, toggleCommentLike, addComment, getComments };
