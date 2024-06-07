import { createRouter } from './context';
import { z } from 'zod';
import * as trpc from '@trpc/server';
import { createAccountSchema } from '../../schema/account.schema';
import { TRPCError } from '@trpc/server';
import console from 'console';
import { getFacebookPageAccessToken, getPageNameandId } from '../../utils/facebook';
import { getInstagramBusinessUsername } from '../../utils/username';
import { cropTypeEnum } from '../../schema/cropType.schema';

export const settingRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  })
  .query('getAccounts', {
    async resolve({ ctx }) {
      const accounts = await ctx.prisma.account.findMany({
        where: {
          userId: ctx.session?.user?.userId
        }
      });
      return accounts;
    }
  })
  .mutation('destroy', {
    input: z.object({
      provider: z.string(z.enum(['tiktok', 'youtube', 'instagram'])),
      providers: z.array(z.enum(['tiktok', 'youtube', 'instagram']))
    }),

    async resolve({ ctx, input }) {
      try {
        await ctx.prisma.$transaction([
          ctx.prisma.setting.updateMany({
            where: { userId: ctx.session?.user?.userId! },
            data: { selectedPlatforms: input.providers }
          }),
          ctx.prisma.account.delete({
            where: {
              userId_provider: {
                userId: ctx.session?.user?.userId!,
                provider: input.provider
              }
            }
          })
        ]);
        //check users settings providers length, if uploadEnabled and providers length is 0 change to uploadEnabled to false
        const userSettings = await ctx.prisma.setting.findFirst({
          where: { userId: ctx.session?.user?.userId! }
        });

        if (userSettings?.uploadEnabled && userSettings.selectedPlatforms.length === 0) {
          await ctx.prisma.setting.updateMany({
            where: { userId: ctx.session?.user?.userId! },
            data: { uploadEnabled: false }
          });
        }

        return;
      } catch (error) {
        console.error('unable to destroy: ', {
          user: ctx.session?.user?.userId,
          provider: input.provider
        });
        if (error instanceof Error) {
          console.log(error.message);
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'failed to remove provider'
        });
      }
    }
  })
  .mutation('createOrUpdate', {
    input: createAccountSchema,

    async resolve({ ctx, input }) {
      console.log('Create Or Update Account - trpc');

      let fbPageName: string | undefined;
      let fbPageId: string | undefined;
      let fbPageAccessToken: string | undefined; //longerm

      if (input.provider === 'instagram') {
        const { pageName, pageId }: { pageName: string; pageId: string } = await getPageNameandId(
          input.access_token
        );
        if (pageId) {
          fbPageAccessToken = await getFacebookPageAccessToken(input.access_token, pageId);
        }
        fbPageId = pageId;
        fbPageName = pageName;
      }
      return await ctx.prisma.account.upsert({
        where: {
          userId_provider: {
            userId: ctx.session?.user?.userId!,
            provider: input.provider
          }
        },
        update: {
          ...input,

          pageName: fbPageName,
          pageId: fbPageId
        },
        create: {
          userId: ctx.session?.user?.userId!,
          ...input,
          pageName: fbPageName,
          pageId: fbPageId,
          pageAccessToken: fbPageAccessToken
        }
      });
    }
  })
  .mutation('addTimeOffet', {
    input: z.number(),
    async resolve({ ctx, input }) {
      try {
        return await ctx.prisma.setting.updateMany({
          where: { userId: ctx.session?.user?.userId! },
          data: { timeOffset: input }
        });
      } catch (error) {
        console.error('unable to update timeOffset', ctx.session?.user?.userId);
        if (error instanceof Error) {
          console.log(error.message);
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'unable to update timeOffset'
        });
      }
    }
  })
  .mutation('updateScheduleTimes', {
    input: z.object({
      scheduleDays: z.object({
        sun: z.array(z.string()),
        mon: z.array(z.string()),
        tue: z.array(z.string()),
        wed: z.array(z.string()),
        thu: z.array(z.string()),
        fri: z.array(z.string()),
        sat: z.array(z.string())
      }),
      timeOffset: z.number()
    }),

    async resolve({ ctx, input }) {
      try {
        const scheduledDays = ctx.prisma.scheduledDays.upsert({
          where: { userId: ctx.session?.user?.userId! },
          update: {
            ...input.scheduleDays
            // setting: {
            //   update: {
            //     timeOffset: input.timeOffset
            //   }
            // }
          },
          create: {
            ...input.scheduleDays,
            setting: {
              connect: { userId: ctx.session?.user?.userId! }
            },
            user: { connect: { id: ctx.session?.user?.userId! } }
          }
        });

        const updateTimeOffset = ctx.prisma.setting.update({
          where: { userId: ctx.session?.user?.userId },
          data: { timeOffset: input.timeOffset }
        });

        return await ctx.prisma.$transaction([scheduledDays, updateTimeOffset]);

        // return await ctx.prisma.setting.updateMany({
        //   where: { userId: ctx.session?.user?.userId! },
        //   data: { ...input }
        // });
      } catch (error) {
        console.error('unable to update scheduleTimes', ctx.session?.user?.userId);
        if (error instanceof Error) {
          console.log(error.message);
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'unable to update scheduleTimes'
        });
      }
    }
  })
  .mutation('updateScheduleSettings', {
    input: z.object({
      id: z.string(),
      settings: z.object({
        minViewCount: z.number(),
        uploadEnabled: z.boolean(),
        defaultApprove: z.boolean(),
        selectedPlatforms: z.array(z.enum(['tiktok', 'youtube', 'instagram', 'facebook'])),
        cropType: cropTypeEnum.nullable(),
        approveDate: z.date(),
        youtubeHashtags: z.array(z.string()).optional(),
        instagramHashtags: z.array(z.string()).optional(),
        youtubeDescription: z.string().optional(),
        youtubePrivacy: z.string(z.enum(['private', 'unlisted', 'public'])).optional(),
        youtubeCategory: z.enum([
          'Film & Animation',
          'Autos & Vehicles',
          'Music',
          'Pets & Animals',
          'Sports',
          'Travel & Events',
          'Gaming',
          'People & Blogs',
          'Comedy',
          'Entertainment',
          'News & Politics',
          'Howto & Style',
          'Education',
          'Science & Technology',
          'Nonprofits & Activism'
        ]),
        facebookDescription: z.string().optional(),
        autoCaption: z.boolean()
      })
    }),
    async resolve({ ctx, input }) {
      try {
        const updatedSettings = await ctx.prisma.setting.update({
          where: { id: input.id },
          data: { ...input.settings }
        });

        // approve all clips
        if (input.settings.defaultApprove && input.settings.minViewCount) {
          await ctx.prisma.twitchClip.updateMany({
            where: {
              userId: ctx.session?.user?.userId!,
              view_count: { gte: input.settings.minViewCount },
              created_at: { gte: input.settings.approveDate.toISOString() },
              AND: {
                approved: false
              }
            },
            data: { approved: true, approvedStatus: 'AUTO_APPROVE', youtubePrivacy: input.settings.youtubePrivacy || 'private' }
          });
        }

        return updatedSettings;
      } catch (error) {
        console.error('unable to update schedule settings', ctx.session?.user?.userId);
        if (error instanceof Error) {
          console.log(error.message);
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'unable to update schedule settings'
        });
      }
    }
  })
  .mutation('setUsername', {
    input: z.object({
      provider: z.enum(['tiktok', 'youtube', 'instagram', 'facebook']),
      username: z.string()
    }),
    async resolve({ ctx, input }) {
      try {
        const accounts = await ctx.prisma.account.updateMany({
          where: {
            userId: ctx.session?.user?.userId,
            provider: input.provider
          },
          data: { username: input.username }
        });
        return accounts;
      } catch (error) {
        console.error('unable to accounts username', {
          userId: ctx.session?.user?.userId,
          username: input.username
        });
        if (error instanceof Error) {
          console.log(error.message);
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'unable to accounts username'
        });
      }
    }
  })
  .mutation('getInstagramUsername', {
    input: z.object({
      token: z.string()
    }),
    async resolve({ ctx, input }) {
      try {
        const username = await getInstagramBusinessUsername(input.token);
        return username;
      } catch (error) {
        console.error('unable to get instgram username', {
          userId: ctx.session?.user?.userId
        });
        if (error instanceof Error) {
          console.log(error.message);
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'unable to accounts username'
        });
      }
    }
  });
