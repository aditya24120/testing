import { createRouter } from './context';
import { z } from 'zod';
import * as trpc from '@trpc/server';
import { createScheduledClipSchema, createToSend } from '../../schema/uploadClip.schema';
import { getUserByIdWithTwitch } from '../../libs/prisma/user';
import { doFbUpload } from '../../utils/facebook';
import { ToSend } from '../../types/types';
import { createGzip } from 'zlib';

export const uploadClipRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  })
  .mutation('createClip', {
    input: createScheduledClipSchema,
    async resolve({ ctx, input }) {
      try {
        const clipData = {
          userId: ctx.session?.user?.userId!,
          broadcasterName: input.currentClip.broadcaster_name,
          broadcasterId: input.currentClip.broadcaster_id,
          creatorName: input.currentClip.creator_name,
          creatorId: input.currentClip.creator_id,
          embedUrl: input.currentClip.embed_url,
          gameId: input.currentClip.game_id,
          language: input.currentClip.language,
          title: input.currentClip.title,
          url: input.currentClip.url,
          videoId: input.currentClip.video_id,
          twitch_id: input.currentClip.twitch_id,
          viewCount: input.currentClip.view_count,
          thumbnailUrl: input.currentClip.thumbnail_url,
          downloadUrl: input.currentClip.download_url,
          caption: input.fields.caption || null,
          youtubeTitle: input.fields.title || null,
          youtubeCategory: input.fields.category || 'Gaming',
          description: input.fields.description || null,
          status: input.status,
          uploadPlatforms: input.uploadPlatforms,
          createdAt: new Date(input.currentClip.created_at),
          cropData: input.cropData,
          uploaded: input.uploaded || false,
          uploadTime: input.scheduledUploadTime ? null : new Date(),
          scheduledUploadTime: input.scheduledUploadTime
            ? new Date(input.scheduledUploadTime)
            : null,
          youtubeUploaded: input.youtubeUploadComplete || false,
          youtubePrivacy: input.fields.privacy || 'private',
          youtubeUploadTime: input.youtubeUploadComplete ? new Date() : null,
          tiktokUploaded: input.tiktokUploadComplete || false,
          tiktokUploadTime: input.tiktokUploadComplete ? new Date() : null,
          instagramUploaded: input.igUploadComplete || false,
          instagramUploadTime: input.igUploadComplete ? new Date() : null,
          youtubeStatus: input.youtubeStatus,
          tiktokStatus: input.tiktokStatus,
          facebookUploaded: input.facebookUploadComplete || false,
          facebookUploadTime: input.facebookUploadComplete ? new Date() : null,
          facebookStatus: input.facebookStatus,
          facebookDescription: input.fields.facebookDescription || null,
          autoCaption: input.currentClip.autoCaption || false
        };

        const uploaded = await ctx.prisma.clip.create({
          data: clipData
        });
        // had to change to upsert, encase we do not have the clip in the DB. Have a issue were getting the latestclip and storing to the db fails
        await ctx.prisma.twitchClip.upsert({
          where: {
            userId_twitch_id: {
              userId: ctx.session?.user?.userId!,
              twitch_id: input.currentClip.twitch_id
            }
          },
          update: {
            scheduled: input.scheduledUploadTime ? true : false,
            uploadPlatforms: input.uploadPlatforms,
            approved: true
          },
          create: {
            ...input.currentClip,
            uploadPlatforms: input.uploadPlatforms,
            scheduled: input.scheduledUploadTime ? true : false,
            approved: true,
            approvedStatus: 'MANUAL_APPROVE',
            user: { connect: { id: ctx.session?.user?.userId! } }
          }
        });

        return uploaded;
      } catch (error) {
        console.log(error);
        throw new trpc.TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }
  })
  .mutation('cancelScheduledClip', {
    input: z.object({
      videoId: z.string(),
      twitch_id: z.string()
    }),

    async resolve({ ctx, input }) {
      const updatedTwitchClip = await ctx.prisma.twitchClip.update({
        where: {
          userId_twitch_id: {
            userId: ctx.session?.user?.userId!,
            twitch_id: input.twitch_id
          }
        },
        data: { scheduled: false }
      });

      console.log({ updatedTwitchClip });
      return await ctx.prisma.clip.updateMany({
        where: {
          userId: ctx.session?.user?.userId,
          id: input.videoId
        },
        data: {
          status: 'CANCELED'
        }
      });
    }
  })
  .mutation('startFbUpload', {
    input: createToSend,
    async resolve({ ctx, input }) {
      try {
        const pageAccessToken = input.igToken?.pageAccessToken;
        const downloadURL = input.fileURL;
        const pageId = input.igToken?.pageId;
        const desc = input.facebookDescription;
        const fbupload = await doFbUpload(pageAccessToken, pageId, downloadURL, desc);

        return { message: 'uploaded', fbupload };
      } catch (e: any) {
        throw new trpc.TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }
  });
