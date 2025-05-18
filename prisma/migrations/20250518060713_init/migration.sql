-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "loginId" TEXT NOT NULL,
    "loginPassword" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YoutubeStream" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "streamStartTime" TIMESTAMP(3) NOT NULL,
    "streamEndTime" TIMESTAMP(3),
    "streamingUrl" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,

    CONSTRAINT "YoutubeStream_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamStats" (
    "id" SERIAL NOT NULL,
    "youtubeStreamId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitTime" TIMESTAMP(3),

    CONSTRAINT "StreamStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "youtubeStreamId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_loginId_key" ON "User"("loginId");

-- CreateIndex
CREATE INDEX "StreamStats_youtubeStreamId_idx" ON "StreamStats"("youtubeStreamId");

-- CreateIndex
CREATE INDEX "StreamStats_userId_idx" ON "StreamStats"("userId");

-- CreateIndex
CREATE INDEX "Chat_youtubeStreamId_idx" ON "Chat"("youtubeStreamId");

-- CreateIndex
CREATE INDEX "Chat_userId_idx" ON "Chat"("userId");

-- AddForeignKey
ALTER TABLE "YoutubeStream" ADD CONSTRAINT "YoutubeStream_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamStats" ADD CONSTRAINT "StreamStats_youtubeStreamId_fkey" FOREIGN KEY ("youtubeStreamId") REFERENCES "YoutubeStream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamStats" ADD CONSTRAINT "StreamStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_youtubeStreamId_fkey" FOREIGN KEY ("youtubeStreamId") REFERENCES "YoutubeStream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
