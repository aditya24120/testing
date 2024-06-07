import { RefreshingAuthProvider } from '@twurple/auth';
import { ClientCredentialsAuthProvider } from '@twurple/auth';
import { ApiClient } from '@twurple/api';
import { TUserWithAccounts } from '../../types/types';
import { prisma } from '../prisma/client';

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error(
    'Please define TWITCH_CLIENT_ID AND TWITCH_CLIENT_SECRET vairables inside .env.local'
  );
}

let api = global.api;

if (!api) {
  api = global.api = { conn: null, promise: null };
}
async function tokenData(userID: string) {
  const account = await prisma.account.findFirst({ where: { userId: userID, provider: 'twitch' } });

  return {
    accessToken: account?.access_token || undefined,
    refreshToken: account?.refresh_token || null,
    scope: account?.scope?.split(' ') || [],
    expiresIn: account?.expires_at || 0,
    obtainmentTimestamp: account?.obtainment_timestamp || 0
  };
}

async function authProvider(user?: TUserWithAccounts) {
  if (user) {
    return new RefreshingAuthProvider(
      {
        clientId,
        clientSecret,
        onRefresh: async (newTokenData) => {
          try {
            await prisma.account.updateMany({
              where: { userId: user.id, provider: 'twitch' },
              data: {
                access_token: newTokenData.accessToken,
                refresh_token: newTokenData.refreshToken,
                scope: newTokenData.scope.join(' '),
                expires_at:
                  newTokenData.expiresIn?.toString.length === 13
                    ? parseInt(String(newTokenData.expiresIn! / 1000))
                    : newTokenData.expiresIn!,
                obtainment_timestamp: parseInt(String(newTokenData.obtainmentTimestamp / 1000))
              }
            });
          } catch (error) {
            console.error('failed to update users refresh token. User: ', user.id);
            if (error instanceof Error) {
              console.log(error.message);
            }
          }
        }
      },
      await tokenData(user.id)
    );
  } else {
    return new ClientCredentialsAuthProvider(clientId, clientSecret);
  }
}

export async function apiClientConnect(user?: TUserWithAccounts) {
  const provider = await authProvider(user);
  if (api.conn) {
    return api.conn;
  }
  if (!api.promise) {
    api.promise = new ApiClient({ authProvider: provider });
  }
  api.conn = await api.promise;
  return api.conn;
}

module.exports = { apiClientConnect };
