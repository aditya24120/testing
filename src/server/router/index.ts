// src/server/router/index.ts
import { createRouter } from './context';
import superjson from 'superjson';

import { settingRouter } from './setting';
import { clipRouter } from './clip';
import { cropTemplateRouter } from './cropTemplate';
import { uploadClipRouter } from './uploadClip';
import { stripeRouter } from './stripe';
import { userRouter } from './user';
import { gameRouter } from './game';
import { transcribeRouter } from './transcribe';

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('setting.', settingRouter)
  .merge('clip.', clipRouter)
  .merge('cropTemplate.', cropTemplateRouter)
  .merge('uploadClip.', uploadClipRouter)
  .merge('stripe.', stripeRouter)
  .merge('user.', userRouter)
  .merge('games.', gameRouter)
  .merge('transcribe.', transcribeRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
