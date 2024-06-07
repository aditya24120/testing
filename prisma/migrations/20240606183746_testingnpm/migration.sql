-- CreateEnum
CREATE TYPE "TranscribeStatus" AS ENUM ('starting', 'processing', 'succeeded', 'failed', 'canceled');

-- CreateEnum
CREATE TYPE "ApproveStatus" AS ENUM ('NOT_APPROVED', 'MANUAL_APPROVE', 'AUTO_APPROVE', 'CANCELED');

-- CreateEnum
CREATE TYPE "CropType" AS ENUM ('NO_CAM', 'CAM_TOP', 'CAM_FREEFORM', 'FREEFORM');

-- CreateEnum
CREATE TYPE "DefaultClipsStatus" AS ENUM ('pending', 'inqueue', 'complete', 'failed');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "refresh_expires_at" INTEGER,
    "obtainment_timestamp" INTEGER NOT NULL DEFAULT 0,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "oauth_token_secret" TEXT,
    "oauth_token" TEXT,
    "username" TEXT,
    "pageName" TEXT,
    "pageId" TEXT,
    "pageAccessToken" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "customer_id" TEXT,
    "sub_id" TEXT,
    "sub_type" INTEGER,
    "sub_time_range" INTEGER,
    "sub_time_created" INTEGER,
    "sub_current_start" INTEGER,
    "sub_current_end" INTEGER,
    "sub_status" TEXT,
    "defaultClips" "DefaultClipsStatus" DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "followerCount" INTEGER NOT NULL DEFAULT 0,
    "Role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL,
    "delay" INTEGER NOT NULL DEFAULT 24,
    "hastags" TEXT,
    "minViewCount" INTEGER NOT NULL DEFAULT 10,
    "uploadFrequency" INTEGER NOT NULL DEFAULT 8,
    "license" TEXT,
    "camCrop" JSONB,
    "screenCrop" JSONB,
    "cropType" "CropType",
    "verticalVideoEnabled" BOOLEAN NOT NULL DEFAULT true,
    "uploadEnabled" BOOLEAN NOT NULL DEFAULT false,
    "defaultApprove" BOOLEAN NOT NULL DEFAULT false,
    "approveDate" TIMESTAMP(3),
    "mainTutorialComplete" BOOLEAN NOT NULL DEFAULT false,
    "clipsTutorialComplete" BOOLEAN NOT NULL DEFAULT false,
    "youtubeHashtags" TEXT[],
    "youtubeTags" TEXT,
    "youtubePrivacy" TEXT NOT NULL DEFAULT 'private',
    "youtubeAutoCategorization" BOOLEAN NOT NULL DEFAULT true,
    "youtubeCategory" TEXT NOT NULL DEFAULT 'Gaming',
    "youtubeDescription" TEXT,
    "instagramCaption" TEXT,
    "lastUploaded" TIMESTAMP(3),
    "lastUploadedId" TEXT,
    "lastUploadTiktok" TIMESTAMP(3),
    "lastUploadYoutube" TIMESTAMP(3),
    "lastInstagramYoutube" TIMESTAMP(3),
    "lastUploadedClipYouTube" TEXT,
    "lastUploadedClipTiktok" TEXT,
    "lastUploadedClipInstagram" TEXT,
    "uploadCount" INTEGER NOT NULL DEFAULT 0,
    "selectedPlatforms" TEXT[],
    "youtubeCount" INTEGER NOT NULL DEFAULT 0,
    "tiktokCount" INTEGER NOT NULL DEFAULT 0,
    "instagramCount" INTEGER NOT NULL DEFAULT 0,
    "timeOffset" INTEGER,
    "instagramHashtags" TEXT[],
    "autoCaption" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clip" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "broadcasterName" TEXT NOT NULL,
    "broadcasterId" TEXT NOT NULL,
    "creatorName" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "embedUrl" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "downloadUrl" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    "uploadPlatforms" TEXT[],
    "uploadTime" TIMESTAMP(3),
    "scheduledUploadTime" TIMESTAMP(3),
    "uploaded" BOOLEAN NOT NULL DEFAULT false,
    "youtubeUploaded" BOOLEAN NOT NULL DEFAULT false,
    "youtubeUploadTime" TIMESTAMP(3),
    "youtubeStatus" TEXT,
    "tiktokUploaded" BOOLEAN NOT NULL DEFAULT false,
    "tiktokUploadTime" TIMESTAMP(3),
    "tiktokStatus" TEXT,
    "instagramUploaded" BOOLEAN NOT NULL DEFAULT false,
    "instagramUploadTime" TIMESTAMP(3),
    "instagramStatus" TEXT,
    "facebookUploaded" BOOLEAN NOT NULL DEFAULT false,
    "facebookUploadTime" TIMESTAMP(3),
    "facebookStatus" TEXT,
    "facebookDescription" TEXT,
    "youtubePrivacy" TEXT NOT NULL DEFAULT 'private',
    "youtubeCategory" TEXT,
    "cropData" JSONB NOT NULL,
    "caption" TEXT,
    "youtubeTitle" TEXT,
    "description" TEXT,
    "renderedUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "twitch_id" TEXT NOT NULL,
    "autoCaption" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwitchClip" (
    "id" TEXT NOT NULL,
    "twitch_id" TEXT NOT NULL,
    "broadcaster_name" TEXT NOT NULL,
    "broadcaster_id" TEXT NOT NULL,
    "creator_name" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "embed_url" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL,
    "thumbnail_url" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "download_url" TEXT NOT NULL,
    "uploaded" BOOLEAN NOT NULL DEFAULT false,
    "uploadPlatforms" TEXT[],
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "scheduled" BOOLEAN NOT NULL DEFAULT false,
    "approvedStatus" "ApproveStatus" NOT NULL DEFAULT 'NOT_APPROVED',
    "youtubePrivacy" TEXT NOT NULL DEFAULT 'private',
    "youtubeCategory" TEXT,
    "youtubeTitle" TEXT,
    "youtubeHashtags" TEXT[],
    "youtubeDescription" TEXT,
    "cropType" "CropType",
    "caption" TEXT,
    "instagramHashtags" TEXT[],
    "facebookDescription" TEXT,
    "startTime" DOUBLE PRECISION,
    "endTime" DOUBLE PRECISION,
    "autoCaption" BOOLEAN NOT NULL DEFAULT false,
    "transcribeComplete" BOOLEAN NOT NULL DEFAULT false,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TwitchClip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'default',
    "cropType" "CropType" NOT NULL,
    "camCrop" JSONB,
    "screenCrop" JSONB NOT NULL,
    "settingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CropTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledDays" (
    "id" TEXT NOT NULL,
    "sun" TEXT[],
    "mon" TEXT[],
    "tue" TEXT[],
    "wed" TEXT[],
    "thu" TEXT[],
    "fri" TEXT[],
    "sat" TEXT[],
    "userId" TEXT NOT NULL,
    "settingId" TEXT NOT NULL,

    CONSTRAINT "ScheduledDays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transcription" (
    "id" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "status" "TranscribeStatus" NOT NULL,
    "jobId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "audioPath" TEXT NOT NULL,
    "textOutput" TEXT NOT NULL,
    "subtitles" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "twitchId" TEXT NOT NULL,

    CONSTRAINT "Transcription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_userId_provider_key" ON "Account"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_userId_key" ON "Setting"("userId");

-- CreateIndex
CREATE INDEX "Clip_userId_twitch_id_idx" ON "Clip"("userId", "twitch_id");

-- CreateIndex
CREATE UNIQUE INDEX "TwitchClip_userId_twitch_id_key" ON "TwitchClip"("userId", "twitch_id");

-- CreateIndex
CREATE UNIQUE INDEX "CropTemplate_name_cropType_settingId_key" ON "CropTemplate"("name", "cropType", "settingId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledDays_userId_key" ON "ScheduledDays"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledDays_settingId_key" ON "ScheduledDays"("settingId");

-- CreateIndex
CREATE UNIQUE INDEX "Transcription_twitchId_key" ON "Transcription"("twitchId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwitchClip" ADD CONSTRAINT "TwitchClip_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropTemplate" ADD CONSTRAINT "CropTemplate_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "Setting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropTemplate" ADD CONSTRAINT "CropTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledDays" ADD CONSTRAINT "ScheduledDays_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledDays" ADD CONSTRAINT "ScheduledDays_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "Setting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
