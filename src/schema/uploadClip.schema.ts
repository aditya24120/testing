import { z } from 'zod';
import { createAccountSchema } from './account.schema';
import { cropSettingsSchema, cropTypeEnum } from './cropType.schema';

export const twitchClipSchema = z.object({
  twitch_id: z.string(),
  broadcaster_name: z.string(),
  broadcaster_id: z.string(),
  creator_name: z.string(),
  creator_id: z.string(),
  embed_url: z.string(),
  game_id: z.string(),
  language: z.string(),
  title: z.string(),
  url: z.string(),
  video_id: z.string(),
  view_count: z.number(),
  thumbnail_url: z.string(),
  created_at: z.string(),
  download_url: z.string(),
  autoCaption: z.boolean().default(false).optional()
});

export const categories = z.enum([
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
]);

export const updateTwitchClipApprove = z.object({
  cropType: cropTypeEnum.optional(),
  youtubeHashtags: z.array(z.string()),
  youtubeDescription: z.string().optional().nullable(),
  youtubePrivacy: z.enum(['public', 'unlisted', 'private']),
  youtubeCategory: categories,
  youtubeTitle: z.string(),
  instagramHashtags: z.array(z.string()),
  caption: z.string(),
  facebookDescription: z.string(),
  startTime: z.number().optional().nullable(),
  endTime: z.number().optional().nullable(),
  autoCaption: z.boolean().default(false)
});

export const clipFieldsSchema = z.object({
  caption: z.string().optional(),
  title: z.string().optional(),
  privacy: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  facebookDescription: z.string().optional().nullable()
});

export const cropDataSchema = z.object({
  camCrop: cropSettingsSchema.optional(),
  screenCrop: cropSettingsSchema,
  cropType: cropTypeEnum,
  startTime: z.number(),
  endTime: z.number()
});

export const platformsSchema = z.enum(['TikTok', 'YouTube', 'Instagram', 'Facebook']);

export const createScheduledClipSchema = z.object({
  currentClip: twitchClipSchema,
  uploadPlatforms: z.array(platformsSchema),
  fields: clipFieldsSchema,
  tiktokUploadComplete: z.boolean().optional(),
  tiktokStatus: z.string().optional(),
  youtubeUploadComplete: z.boolean().optional(),
  youtubeStatus: z.string().optional(),
  igUploadComplete: z.boolean().optional(),
  facebookUploadComplete: z.boolean().optional(),
  instagramStatus: z.string().optional(),
  facebookStatus: z.string().optional(),
  cropData: cropDataSchema,
  uploaded: z.boolean(),
  status: z.string(),
  scheduledUploadTime: z.string().optional()
});
export const createToSend = z.object({
  tiktokSessionId: createAccountSchema.optional().nullable(),
  youtubeToken: createAccountSchema.optional().nullable(),
  igToken: createAccountSchema.optional().nullable(),
  uploadCounter: z.number(),
  caption: z.string().optional(),
  title: z.string().optional(),
  privacy: z.string().optional(),
  description: z.string().optional(),
  facebookDescription: z.string().optional(),
  platforms: z.array(platformsSchema),
  fileURL: z.string()
});

export type CreateScheduledClipInput = z.TypeOf<typeof createScheduledClipSchema>;
export type updateTwitchClipApprove = z.TypeOf<typeof updateTwitchClipApprove>;
export type createToSend = z.TypeOf<typeof createToSend>;
