-- CreateTable
CREATE TABLE "Board" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "activityAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorTrip" TEXT,
    "authorEmail" TEXT,
    "lastBumpedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "no" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "trip" TEXT,
    "email" TEXT,
    "body" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "uaHash" TEXT NOT NULL,
    "wasSaged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Board_slug_key" ON "Board"("slug");

-- CreateIndex
CREATE INDEX "Thread_boardId_lastBumpedAt_idx" ON "Thread"("boardId", "lastBumpedAt");

-- CreateIndex
CREATE INDEX "Post_threadId_createdAt_idx" ON "Post"("threadId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Post_threadId_no_key" ON "Post"("threadId", "no");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "Board"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

