import { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import Stories from '../components/Stories';
import MobileBottomNav from '../components/MobileBottomNav';
import MobileHeader from '../components/MobileHeader';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function FeedPage() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const observerRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Fetch posts with pagination
    const fetchPosts = async (pageNum, isInitial = false) => {
        try {
            setIsLoadingMore(true);
            // Initial load: 5 posts, subsequent loads: 3 posts
            const limit = isInitial ? 5 : 3;
            const { data } = await api.get(`/posts?page=${pageNum}&limit=${limit}`);

            if (data.length < limit) {
                setHasMore(false);
            }

            if (isInitial) {
                setPosts(data);
            } else {
                // Filter out duplicates by checking if post.id already exists
                setPosts(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newPosts = data.filter((post) => !existingIds.has(post.id));
                    return [...prev, ...newPosts];
                });
            }
        } catch (error) {
            console.error('Failed to fetch posts', error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Reload all posts (for when a new post is created)
    const reloadPosts = async () => {
        setPage(1);
        setHasMore(true);
        await fetchPosts(1, true);
    };

    // Initial load
    useEffect(() => {
        if (user) {
            fetchPosts(1, true);
        }
    }, [user]);

    // Load more posts when scrolling
    const loadMore = useCallback(() => {
        if (!isLoadingMore && hasMore) {
            setPage(prev => {
                const nextPage = prev + 1;
                fetchPosts(nextPage, false);
                return nextPage;
            });
        }
    }, [isLoadingMore, hasMore]);

    // Set up Intersection Observer to trigger when 2 posts from bottom
    useEffect(() => {
        if (!hasMore || isLoadingMore) return;

        // Clean up previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        // Create new observer
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            }
        );

        // Observe the trigger element (which will be positioned at 2 posts from bottom)
        if (triggerRef.current) {
            observerRef.current.observe(triggerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [posts, hasMore, isLoadingMore, loadMore]);

    if (loading || !user) {
        return <div suppressHydrationWarning>Loading...</div>;
    }

    return (
        <>
            <MobileHeader />
            <Navbar />
            <div className="_layout _layout_main_wrapper">
                <div className="_main_layout">
                    <div className="container _custom_container">
                        <div className="_layout_inner_wrap">
                            <div className="row">
                                <LeftSidebar />
                                <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                    <div className="_layout_middle_wrap">
                                        <div className="_layout_middle_inner">
                                            <Stories />
                                            <CreatePost onPostCreated={reloadPosts} />
                                            {posts.map((post, index) => (
                                                <div key={post.id}>
                                                    <PostCard post={post} />
                                                    {/* Place trigger at 2 posts from the end */}
                                                    {index === posts.length - 3 && hasMore && (
                                                        <div ref={triggerRef} style={{ height: '1px' }} />
                                                    )}
                                                </div>
                                            ))}
                                            {isLoadingMore && (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '20px',
                                                    color: '#65676b'
                                                }}>
                                                    Loading more posts...
                                                </div>
                                            )}
                                            {!hasMore && posts.length > 0 && (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '20px',
                                                    color: '#65676b'
                                                }}>
                                                    No more posts to load
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <RightSidebar />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <MobileBottomNav />
        </>
    );
}

