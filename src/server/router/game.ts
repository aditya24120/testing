import { createRouter } from './context';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { getUserByIdWithTwitch } from '../../libs/prisma/user';
import { Game, getGamesByIds } from '../../libs/twitchApi/games';

export const gameRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  })
  .query('getGamesByIds', {
    input: z.array(z.string()),
    async resolve({ ctx, input }) {
      const user = await getUserByIdWithTwitch(ctx.session?.user?.userId!);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      try {
        const games: Game[] = await getGamesByIds(input, user);
        return games;
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'unable to get games by id'
        });
      }
    }
  });
