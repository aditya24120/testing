import z from 'zod';

export const createAccountSchema = z.object({
  type: z.string(),
  provider: z.string(),
  providerAccountId: z.string(),
  refresh_token: z.string().optional().nullable(),
  access_token: z.string(),
  expires_at: z.number().optional().nullable(),
  refresh_expires_at: z.number().optional().nullable(),
  obtainment_timestamp: z.number().optional(),
  token_type: z.string().optional(),
  scope: z.string().optional(),
  id_token: z.string().optional().nullable(),
  session_state: z.string().optional().nullable(),
  oauth_token_secret: z.string().optional().nullable(),
  oauth_token: z.string().optional().nullable(),
  pageName: z.string().optional().nullable(),
  pageId: z.string().optional().nullable(),
  pageAccessToken: z.string().optional().nullable()
});

export type CreateAccountInput = z.TypeOf<typeof createAccountSchema>;
