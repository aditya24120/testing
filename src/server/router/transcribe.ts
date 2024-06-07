import { createRouter } from './context';
import * as trpc from '@trpc/server';
import { z } from 'zod';
import { TranscriptionInput, TypeTranscriptionResponse } from '../../schema/transcribe.schema';

export const transcribeRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  })
  .mutation('getSRT', {
    input: z.object({
      video_url: z.string(),
      twitch_id: z.string()
    }),
    async resolve({ input, ctx }) {
      // 'https://clips-media-assets2.twitch.tv/oyp7-OfigWgCO8ugiWPCDg/AT-cm%7Coyp7-OfigWgCO8ugiWPCDg.mp4'

      // check if current clip already has transcription
      const alreadyExists = await ctx.prisma.transcription.findFirst({
        where: { twitchId: input.twitch_id }
      });
      if (alreadyExists) {
        return { alreadyExists: true };
      }

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Pinned to a specific version of Stable Diffusion
          // See https://replicate.com/stability-ai/stable-diffussion/versions
          version: '7f686e243a96c7f6f0f481bcef24d688a1369ed3983cea348d1f43b879615766',

          // This is the text prompt that will be submitted by a form on the frontend
          input: {
            audio_path: input.video_url,
            format: 'srt'
          }
        })
      });
      if (response.status !== 201) {
        let error = await response.json();
        console.log(error.detail);
        throw new trpc.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.detail });
      }

      const transcribe: TypeTranscriptionResponse = await response.json();
      return { data: transcribe, alreadyExists: false };
    }
  })
  .mutation('checkStatus', {
    input: z.object({
      jobId: z.string()
    }),
    async resolve({ input }) {
      //4jrg7ulnd5b3zfgxt36gxzoxaa
      const response = await fetch(`https://api.replicate.com/v1/predictions/${input.jobId}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status !== 200) {
        let error = await response.json();
        console.log(error.detail);
        throw new trpc.TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.detail });
      }

      const prediction: TypeTranscriptionResponse = await response.json();
      return prediction;
    }
  })
  .mutation('updateAutoCaption', {
    input: z.object({ twitch_id: z.string(), autoCation: z.boolean() }),
    async resolve({ input, ctx }) {
      try {
        const updated = await ctx.prisma.twitchClip.updateMany({
          where: { userId: ctx.session?.user?.userId, twitch_id: input.twitch_id },
          data: { autoCaption: input.autoCation }
        });
        return updated;
      } catch (error) {
        throw new trpc.TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }
  })
  .mutation('cancelJob', {
    input: z.object({ jobId: z.string() }),
    async resolve({ input }) {
      const response = await fetch(
        `https://api.replicate.com/v1/predictions/${input.jobId}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            // Pinned to a specific version of Stable Diffusion
            // See https://replicate.com/stability-ai/stable-diffussion/versions
            version: '7f686e243a96c7f6f0f481bcef24d688a1369ed3983cea348d1f43b879615766'
          })
        }
      );
      return response;
    }
  })
  .mutation('save', {
    input: TranscriptionInput,
    async resolve({ ctx, input }) {
      try {
        const transcript = await ctx.prisma.transcription.create({ data: input });
        if (input.status === 'succeeded') {
          const updateClip = await ctx.prisma.twitchClip.updateMany({
            where: { twitch_id: input.twitchId, userId: ctx.session?.user?.userId },
            data: { transcribeComplete: true }
          });
        }

        return transcript;
      } catch (error) {
        console.log(error);
        throw new trpc.TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }
  })
  .mutation('updateAutoCaptionSettings', {
    input: z.object({ autoCaption: z.boolean() }),
    async resolve({ ctx, input }) {
      try {
        const updatedSettings = await ctx.prisma.setting.update({
          where: { userId: ctx.session?.user?.userId },
          data: { autoCaption: input.autoCaption }
        });

        return updatedSettings;
      } catch (error) {
        console.log(error);
        throw new trpc.TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
    }
  });
