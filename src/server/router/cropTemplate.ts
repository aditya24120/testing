import { createRouter } from './context';
import { createCropTemplateSchema, cropTypeEnum } from '../../schema/cropType.schema';
import * as trpc from '@trpc/server';
import { getUserByIdWithTwitch } from '../../libs/prisma/user';
import { z } from 'zod';

export const cropTemplateRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  })
  .mutation('createOrUpdate', {
    input: createCropTemplateSchema,
    async resolve({ ctx, input }) {
      const user = await getUserByIdWithTwitch(ctx.session?.user?.userId!, true);

      if (!user || !user.settings) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND' });
      }
      const settings = user.settings;

      return await ctx.prisma.cropTemplate.upsert({
        where: {
          name_cropType_settingId: {
            name: input.name ?? 'default',
            settingId: settings.id,
            cropType: input.cropType
          }
        },
        update: { ...input },
        create: {
          ...input,
          user: { connect: { id: ctx.session?.user?.userId } },
          setting: { connect: { id: settings.id } }
        }
      });
    }
  })
  .mutation('destroy', {
    input: z.string(),
    async resolve({ ctx, input }) {
      const id = input;
      try {
        await ctx.prisma.cropTemplate.delete({
          where: {
            id
          }
        });
        return { id };
      } catch (error) {
        console.log(error);
        return { id };
      }
    }
  })
  .query('getAll', {
    input: z
      .object({
        cropType: cropTypeEnum.optional(),
        name: z.string().optional()
      })
      .optional(),
    async resolve({ ctx, input }) {
      try {
        const user = await getUserByIdWithTwitch(ctx.session?.user?.userId!, true);

        if (!user || !user.settings) {
          throw new trpc.TRPCError({ code: 'NOT_FOUND', message: 'Settings not found' });
        }
        const settings = user.settings;
        return await ctx.prisma.cropTemplate.findMany({
          where: { settingId: settings.id, cropType: input?.cropType, name: input?.name }
        });
      } catch (error) {
        console.log(error);
      }
    }
  })
  .query('getById', {
    input: z.string(),
    async resolve({ ctx, input }) {
      try {
        const user = await getUserByIdWithTwitch(ctx.session?.user?.userId!, true);

        if (!user || !user.settings) {
          throw new trpc.TRPCError({ code: 'NOT_FOUND', message: 'Settings not found' });
        }
        const settings = user.settings;
        const cropTemplate = await ctx.prisma.cropTemplate.findUnique({
          where: { id: input }
        });

        if (!cropTemplate) {
          throw new trpc.TRPCError({ code: 'NOT_FOUND', message: 'Template not found' });
        }
        if (cropTemplate.settingId !== settings.id) {
          throw new trpc.TRPCError({ code: 'FORBIDDEN' });
        }
        return cropTemplate;
      } catch (error) {
        console.log(error);
      }
    }
  })
  .query('getFirstByType', {
    input: z.object({
      cropType: cropTypeEnum,
      name: z.string().optional()
    }),
    async resolve({ ctx, input }) {
      try {
        const user = await getUserByIdWithTwitch(ctx.session?.user?.userId!, true);

        if (!user || !user.settings) {
          throw new trpc.TRPCError({ code: 'NOT_FOUND', message: 'Settings not found' });
        }
        const settings = user.settings;
        const cropTemplate = await ctx.prisma.cropTemplate.findFirst({
          where: {
            settingId: settings.id,
            cropType: input.cropType,
            name: input?.name ?? 'default'
          }
        });

        if (!cropTemplate) {
          throw new trpc.TRPCError({ code: 'NOT_FOUND', message: 'Template not found' });
        }
        if (cropTemplate.settingId !== settings.id) {
          throw new trpc.TRPCError({ code: 'FORBIDDEN' });
        }
        return cropTemplate;
      } catch (error) {
        console.log(error);
      }
    }
  });
