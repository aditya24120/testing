import { createRouter } from './context';
import { z } from 'zod';
import * as trpc from '@trpc/server';
import { getUserByIdWithTwitch } from '../../libs/prisma/user';
import { Clip, ClipWithYoutube } from '../../types/types';
import {
  createClip,
  getClipById,
  getPopularClips,
  getRecentClips,
  getUserByName,
  previous14Date
} from '../../libs/twitchApi/clips';
import { twitchClipSchema, updateTwitchClipApprove } from '../../schema/uploadClip.schema';
import { TwitchClip } from '@prisma/client';
import dayjs from 'dayjs';

export const previousXDays = (days = 14, startDate?: string) => {
  const start = startDate ? new Date(startDate) : new Date();
  const priorDate = start.setDate(start.getDate() - days);
  const ISO = new Date(priorDate).toISOString();

  return ISO;
};

export const clipRouter = createRouter()
  .query('getUsersClips', {
    input: z
      .object({ startDate: z.date(), endDate: z.date(), changed: z.boolean().default(false) })
      .optional(),
    async resolve({ ctx, input }) {
      if (!ctx.session || !ctx.session.user) {
        return;
      }
      let popularClips = false;
      //Get the user
      const user = await getUserByIdWithTwitch(ctx.session?.user?.userId);
      if (!user) {
        console.error('no user found');
        return { clips: [], popularClips, count: 0, noUser: true };
      }

      const broadcasterId = user.accounts[0]?.providerAccountId;
      if (!broadcasterId) {
        console.error('no broadcasterId found');
        return { clips: [], popularClips, count: 0 };
      }

      // start and end dates
      const startDate = input?.startDate
        ? new Date(input.startDate.setHours(0, 0, 0, 0)).toISOString()
        : previous14Date();
      const endDate =
        input?.endDate && new Date(input.endDate.setHours(23, 59, 59, 999)).toISOString();

      console.info('trying to get users clips', {
        userId: ctx.session.user.userId,
        name: ctx.session.user.name,
        startDate,
        endDate
      });

      let clips: TwitchClip[] | Clip[];
      if (!user.defaultClips || user.defaultClips !== 'complete') {
        // get clips from twitch api
        clips = await getRecentClips(broadcasterId, startDate, endDate, user);
      } else {
        // get clips from db
        clips = await ctx.prisma.twitchClip.findMany({
          where: { userId: ctx.session.user.userId, created_at: { gte: startDate, lte: endDate } },
          orderBy: { created_at: 'desc' },
          take: 200
        });
      }

      // if no clips get most popular clips
      if (clips.length === 0 && !input?.changed) {
        popularClips = true;
        console.error('no clips found, getting new clips');

        clips = (await getPopularClips(user)) as Clip[];
      }

      for (let clip of clips) {
        await ctx.prisma.twitchClip.upsert({
          where: {
            userId_twitch_id: { userId: ctx.session.user.userId, twitch_id: clip.twitch_id }
          },
          update: { ...clip },
          create: { userId: ctx.session.user.userId, ...clip }
        });
      }

      const existingClips = await ctx.prisma.twitchClip.findMany({
        where: {
          userId: ctx.session.user.userId,
          twitch_id: { in: clips.map((clip) => clip.twitch_id) }
        }
      });

      const existingClipMap = new Map(
        existingClips.map((clip) => [clip.twitch_id, clip])
      );

      clips = await Promise.all(clips.map(async (clip) => {
        const existingClip = existingClipMap.get(clip.twitch_id);

        if (existingClip) {
          return { ...clip, approved: existingClip.approved, approvedStatus: existingClip.approvedStatus };
        } else {
          const userId = ctx.session?.user?.userId as string;

          const newClip = await ctx.prisma.twitchClip.create({
            data: { userId: userId, ...clip }
          });

          return newClip;
        }
      }));

      const settings = await ctx.prisma.setting.findFirst({
        where: { userId: ctx.session?.user?.userId! }
      });

      if (settings?.defaultApprove && settings.minViewCount) {
        const approveDate = new Date(settings.approveDate as Date);

        const userId = ctx.session?.user?.userId as string;

        clips = await Promise.all(clips.map(async (clip: any) => {
          if (!clip.approved && clip.view_count >= settings.minViewCount && new Date(clip.created_at) >= approveDate && clip.approvedStatus !== 'CANCELED') {
            try {
              await ctx.prisma.twitchClip.update({
                where: {
                  userId_twitch_id: { userId: userId, twitch_id: clip.twitch_id },
                },
                data: { approved: true, approvedStatus: 'AUTO_APPROVE' },
              });
              return { ...clip, approved: true, approvedStatus: 'AUTO_APPROVE' };
            } catch (err) {
              console.log(err);
            }
          }
          return clip;
        }));
      }

      return { clips, popularClips, count: clips.length };
    }
  })
  .query('getClipsByUserId', {
    input: z.object({
      startDate: z.date(),
      endDate: z.date(),
      username: z.string().optional()
    }),
    async resolve({ ctx, input }) {
      if (!ctx.session || !ctx.session.user) {
        return;
      }
      const user = await getUserByIdWithTwitch(ctx.session?.user?.userId);
      if (!user) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      }

      const broadcasterId = user.accounts[0]?.providerAccountId;
      if (!broadcasterId) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      }

      const startDate = new Date(input.startDate.setHours(0, 0, 0, 0)).toISOString();
      const endDate = new Date(input.endDate.setHours(23, 59, 59, 999)).toISOString();

      console.log('trpc startDate: ', startDate);
      console.log('trpc endtDate: ', endDate);
      console.log('Get recent clips by start and end Date');
      let clips: Clip[] | null = await getRecentClips(broadcasterId, startDate, endDate, user);
      if (clips.length === 0) {
        console.log('No recent clips found');
        console.log('Most popular clips');
        clips = await getPopularClips(user);
      }

      return clips;
    }
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  })
  .query('scheduledClips', {
    async resolve({ ctx }) {
      return await ctx.prisma.clip.findMany({
        where: {
          OR: [
            {
              status: 'SCHEDULED'
            },
            {
              status: 'RENDERED'
            }
          ],
          AND: {
            userId: ctx.session?.user?.userId,
            uploaded: false,
            NOT: [{ scheduledUploadTime: null }]
          }
        },
        orderBy: { scheduledUploadTime: 'asc' },
        take: 9
      });
    }
  })
  .query('uploadedClips', {
    async resolve({ ctx }) {
      return await ctx.prisma.clip.findMany({
        where: {
          status: {
            startsWith: 'SUCCESS'
          },
          userId: ctx.session?.user?.userId,
          uploaded: true
        },
        orderBy: { uploadTime: 'desc' },
        take: 9
      });
    }
  })
  .query('approvedClips', {
    async resolve({ ctx }) {
      return await ctx.prisma.twitchClip.findMany({
        where: {
          userId: ctx.session?.user?.userId,
          AND: [{ scheduled: false }, { uploaded: false }],
          approved: true
        },
        orderBy: { created_at: 'asc' },
        take: 9
      });
    }
  })
  .mutation('unapproveById', {
    input: z.string(),
    async resolve({ ctx, input }) {
      return await ctx.prisma.twitchClip.update({
        where: {
          userId_twitch_id: {
            userId: ctx.session?.user?.userId!,
            twitch_id: input
          }
        },
        data: { approved: false, approvedStatus: 'CANCELED' }
      });
    }
  })
  .query('getFirstPopularClips', {
    async resolve({ ctx }) {
      const user = await getUserByIdWithTwitch(ctx.session?.user?.userId!);
      if (!user) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      }
      const clips: Clip[] | null = await getPopularClips(user);

      return clips?.[0];
    }
  })
  .query('getClipById', {
    input: z.string(),

    async resolve({ ctx, input }) {
      const user = await getUserByIdWithTwitch(ctx.session?.user?.userId!, true);

      if (!user || !user.settings) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      }

      let clip: ClipWithYoutube | Clip | null;

      clip = await ctx.prisma.twitchClip.findUnique({
        where: { userId_twitch_id: { userId: ctx.session?.user?.userId!, twitch_id: input } }
      });

      if (!clip) {
        clip = await getClipById(input, user);
      }

      if (!clip) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      }

      return clip;
    }
  })
  .mutation('getTwitchUserByUsername', {
    input: z.string(),
    async resolve({ ctx, input }) {
      const user = await getUserByIdWithTwitch(ctx.session?.user?.userId!);
      if (!user) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
      const twitchUser = await getUserByName(input, user);
      if (!twitchUser) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND', message: 'twitch user not found' });
      }

      return twitchUser;
    }
  })
  .mutation('recentClipsByUsername', {
    input: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_]{0,25}$/),
    async resolve({ ctx, input }) {
      const user = await getUserByIdWithTwitch(ctx.session?.user?.userId!);
      if (!user) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
      const clips = await getRecentClips(input, undefined, undefined, user);

      return clips;
    }
  })
  .query('getUsersLatestClips', {
    async resolve({ ctx }) {
      const userId = ctx.session?.user?.userId!;
      if (!userId) {
        throw new trpc.TRPCError({ code: 'FORBIDDEN' });
      }
      const user = await getUserByIdWithTwitch(userId, true);
      if (!user) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      }

      const broadcasterId = user.accounts[0]?.providerAccountId;
      if (!broadcasterId) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      }

      const allowedDefaultStatus = ['complete', 'failed'];
      if (!user.defaultClips || !allowedDefaultStatus.includes(user.defaultClips)) {
        return [];
      }

      const lastUploadedDate = user.settings?.lastUploaded;
      const mostRecentClipDate = lastUploadedDate && new Date(lastUploadedDate).toISOString();

      console.log({ lastUploadedDate, mostRecentClipDate });

      const daysAgo = previousXDays(3);
      const oldestClipDate =
        mostRecentClipDate && daysAgo > mostRecentClipDate ? mostRecentClipDate : daysAgo;

      const clips = await getRecentClips(broadcasterId, oldestClipDate, undefined, user);
      if (clips.length === 0) return [];

      // check if clips length === 1 if so check if the clip is the same as the last uploaded clip
      // twitch api always returns the most recent clip using its date
      const date1 = dayjs(oldestClipDate);
      const date2 = dayjs();
      const diffDays = date2.diff(date1, 'day');
      if (clips.length === 1 && diffDays > 4) {
        const lastUploadedClipId = user.settings?.lastUploadedId;
        if (lastUploadedClipId === clips[0].twitch_id) {
          return [];
        }
      }

      // add new clips to db
      for (let clip of clips) {
        await ctx.prisma.twitchClip.upsert({
          where: {
            userId_twitch_id: { userId, twitch_id: clip.twitch_id }
          },
          update: {
            ...clip
          },
          create: {
            userId,
            ...clip
          }
        });
      }
      // update latest clip in users settings
      await ctx.prisma.setting.update({
        where: { userId },
        data: { lastUploaded: new Date(clips[0].created_at), lastUploadedId: clips[0].twitch_id }
      });
      return clips;
    }
  })
  .mutation('approveTwitchClip', {
    input: z.object({
      clip: twitchClipSchema,
      approveData: updateTwitchClipApprove
    }),
    async resolve({ ctx, input }) {
      try {
        return await ctx.prisma.twitchClip.upsert({
          where: {
            userId_twitch_id: {
              userId: ctx.session?.user?.userId!,
              twitch_id: input.clip.twitch_id
            }
          },
          update: { ...input.approveData, approved: true, approvedStatus: 'MANUAL_APPROVE' },
          create: {
            ...input.clip,
            ...input.approveData,
            approved: true,
            approvedStatus: 'MANUAL_APPROVE',
            user: { connect: { id: ctx.session?.user?.userId! } }
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
        }
        throw new trpc.TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'approveTwitchClip error'
        });
      }
    }
  })
  .mutation('createClip', {
    resolve: async ({ ctx }) => {
      try {
        const user = await getUserByIdWithTwitch(ctx.session?.user?.userId!);

        if (user == null) {
          throw new trpc.TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'User not found'
          });
        }

        return await createClip(user);
      } catch (error: any) {
        if (error instanceof Error) {
          console.log(error.message);
        }

        if (error?.message?.includes('scopes')) {
          throw new trpc.TRPCError({
            code: 'FORBIDDEN',
            message: 'Missing permissions. Please sign out and sign in.'
          });
        }

        if (error?.message?.includes('offline')) {
          throw new trpc.TRPCError({
            code: 'BAD_REQUEST',
            message: 'Clipping is not possible for an offline channel.'
          });
        }

        throw new trpc.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'createClip error' });
      }
    }
  });
