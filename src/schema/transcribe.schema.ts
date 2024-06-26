import { z } from 'zod';

export const TranscriptionApiResponse = z.object({
  completed_at: z.string().nullable(),
  created_at: z.string().nullable(),
  error: z.string().nullable(),
  id: z.string(),
  input: z.object({
    format: z.string(),
    audio_path: z.string()
  }),
  logs: z.string().nullable(),
  metrics: z.object({ predict_time: z.number().optional() }),
  output: z
    .object({
      text: z.string(),
      language: z.string(),
      subtitles: z.string()
    })
    .nullable(),
  started_at: z.string().nullable(),
  status: z.enum(['starting', 'processing', 'succeeded', 'failed', 'canceled']),
  urls: z.object({
    get: z.string(),
    cancel: z.string()
  }),
  version: z.string(),
  webhook_completed: z.boolean().nullable()
});

export const TranscriptionInput = z.object({
  completedAt: z.string(),
  createdAt: z.string(),
  startedAt: z.string(),
  status: z.enum(['starting', 'processing', 'succeeded', 'failed', 'canceled']),
  jobId: z.string(),
  format: z.string(),
  audioPath: z.string(),
  textOutput: z.string(),
  subtitles: z.string(),
  language: z.string(),
  version: z.string(),
  twitchId: z.string()
});

export type TypeTranscriptionResponse = z.TypeOf<typeof TranscriptionApiResponse>;
