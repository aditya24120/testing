import { z } from 'zod';

export const cropTypeEnum = z.enum(['NO_CAM', 'CAM_TOP', 'CAM_FREEFORM', 'FREEFORM']);

export const cropSettingsSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  scaleX: z.number().optional(),
  scaleY: z.number().optional(),
  isNormalized: z.boolean().optional()
});

export const createCropTemplateSchema = z.object({
  name: z.string().optional(),
  cropType: cropTypeEnum,
  camCrop: cropSettingsSchema.optional(),
  screenCrop: cropSettingsSchema,
  templateId: z.string().optional()
});

export type CreateCropTypeInput = z.TypeOf<typeof createCropTemplateSchema>;
