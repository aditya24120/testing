import NextAuth, { Profile, User, Account, type NextAuthOptions } from 'next-auth';
import TwitchProvider from 'next-auth/providers/twitch';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../libs/prisma/client';
import axios from 'axios';

const baseUrl = process.env.BASE_URL;

const createDefaultSettings = async ({ user }: { user: User }) => {
  try {
    await prisma.setting.create({ data: { user: { connect: { id: user.id } } } });
  } catch (error) {
    console.log(error);
    console.log('unable to create user settings');
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
};

const updateRefreshToken = async ({
  user,
  account,
  profile,
  isNewUser
}: {
  user: User;
  account: Account;
  profile?: Profile | undefined;
  isNewUser?: boolean;
}) => {
  try {
    if (!isNewUser) {
      const updatedAccount = await prisma.account.updateMany({
        where: { userId: user.id, provider: 'twitch' },
        data: {
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          scope: account.scope,
          expires_at: account.expires_at,
          obtainment_timestamp: 0,
          id_token: account.id_token
        }
      });
      console.log('updatedAccount: ', updatedAccount);
    }
    if (isNewUser) {
      try {
        const res = await axios.post(
          `${baseUrl}api/newUserQueue`,
          {
            userId: user.id
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
      } catch (error) {
        if (error instanceof Error) {
          console.log(error.message);
        }
        console.log('error adding new user to queue');
      }
    }
  } catch (error) {
    console.log('errror updating account on signIn');
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Configure one or more authentication providers
  providers: [
    TwitchProvider({
      clientId: process.env.TWITCH_CLIENT_ID,
      clientSecret: process.env.TWITCH_CLIENT_SECRET,
      authorization: { params: { scope: 'openid user:read:email clips:edit' } }
    })
    // ...add more providers here
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt'
  },
  pages: {
    error: '/auth/error' // Error code passed in query string as ?error=
  },
  // @ts-ignore
  events: { createUser: createDefaultSettings, signIn: updateRefreshToken },
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      // @ts-ignore
      session.accessToken = token.accessToken;
      if (token.sub && session.user) {
        session.user.userId = token.sub;
      }

      return session;
    },
    async signIn({ user, account, profile, email, credentials }) {
      const isAllowedToSignIn = Boolean(user.email);
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        // return false;
        return '/auth/error?error=NoEmail';
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    }
  }
};

export default NextAuth(authOptions);
