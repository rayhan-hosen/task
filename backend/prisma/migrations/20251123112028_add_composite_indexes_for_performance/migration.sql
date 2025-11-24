-- CreateIndex
CREATE INDEX `Comment_postId_createdAt_idx` ON `Comment`(`postId`, `createdAt`);

-- CreateIndex
CREATE INDEX `Like_userId_postId_idx` ON `Like`(`userId`, `postId`);

-- CreateIndex
CREATE INDEX `Like_userId_commentId_idx` ON `Like`(`userId`, `commentId`);

-- CreateIndex
CREATE INDEX `Post_privacy_createdAt_idx` ON `Post`(`privacy`, `createdAt`);
