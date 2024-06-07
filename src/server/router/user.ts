import { createRouter } from './context';
import * as trpc from '@trpc/server';
import { getUserByIdWithAllAccounts, getUserByIdWithTwitch } from '../../libs/prisma/user';
type Days = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
const initialScheduleDaysState: { [key in Days]: string[] } = {
  sun: [],
  mon: [],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: []
};

// Exclude keys from user
function exclude<User, Key extends keyof User>(user: User, ...keys: Key[]): Omit<User, Key> {
  for (let key of keys) {
    delete user[key];
  }
  return user;
}

export const userRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new trpc.TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  })
  .query('getDetails', {
    async resolve({ ctx }) {
      const user = await getUserByIdWithTwitch(ctx.session?.user?.userId!);
      if (!user) {
        throw new trpc.TRPCError({ code: 'UNAUTHORIZED', message: 'no user' });
      }
      const userWithoutPassword = exclude(user, 'email', 'accounts', 'emailVerified');
      return userWithoutPassword;
    }
  })
  .query('getAccountsAndSettings', {
    async resolve({ ctx }) {
      const user = await getUserByIdWithAllAccounts(ctx.session?.user?.userId!, true, true, true);
      if (!user) {
        throw new trpc.TRPCError({ code: 'FORBIDDEN', message: 'FORBIDDEN' });
      }
      const userSettings = user.settings;
      if (!userSettings) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND', message: 'Error getting user data' });
      }

      const scheduledDays =
        (user.ScheduledDays && exclude(user.ScheduledDays, 'id', 'userId', 'settingId')) ??
        initialScheduleDaysState;

      const cropTemplate = await ctx.prisma.cropTemplate.findMany({
        where: { settingId: userSettings.id }
      });

      const userAccounts = user.accounts.map((acc) => acc.provider);

      if (!userAccounts) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND', message: 'Error getting user data' });
      }
      const userWithoutEmail = exclude(user, 'email', 'emailVerified', 'settings', 'accounts');

      return {
        user: userWithoutEmail,
        settings: userSettings,
        scheduledDays,
        accounts: userAccounts,
        cropTemplate: cropTemplate
      };
    }
  })
  .query('getUsersTwitchScopes', {
    async resolve({ ctx }) {
      const user = await getUserByIdWithAllAccounts(ctx.session?.user?.userId!, true, true, true);
      if (!user) {
        throw new trpc.TRPCError({ code: 'NOT_FOUND', message: 'Error finding user' });
      }

      const twitchAccount = user.accounts.find((account) => account.provider == 'twitch');
      if (!twitchAccount) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
          message: "Error finding user's twitch account"
        });
      }

      const twitchScopes = twitchAccount.scope?.split(' ');
      return twitchScopes;
    }
  });
