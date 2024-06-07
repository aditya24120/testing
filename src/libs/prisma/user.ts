import { Account } from '../../types/types';
import { prisma } from './client';

export const getUserByEmailWithTwitch = async (email: string, settings = false) => {
  const user = await prisma.user.findFirst({
    where: { email },
    include: { accounts: { where: { provider: 'twitch' } }, settings }
  });
  return user;
};

export const getUserByIdWithTwitch = async (id: string, settings = false) => {
  const user = await prisma.user.findFirst({
    where: { id },
    include: { accounts: { where: { provider: 'twitch' } }, settings }
  });
  return user;
};

export const getUserByEmailWithAllAccounts = async (
  email: string,
  accounts: boolean | object = true,
  settings = false
) => {
  const user = await prisma.user.findFirst({
    where: { email },
    include: { accounts, settings }
  });
  return user;
};

export const getUserByIdWithAllAccounts = async (
  id: string,
  accounts: boolean | object = true,
  settings = false,
  ScheduledDays = false
) => {
  const user = await prisma.user.findFirst({
    where: { id },
    include: { accounts, settings, ScheduledDays }
  });
  return user;
};

export const createAccount = async (accountData: Account) => {
  const account = await prisma.account.create({ data: { ...accountData } });
  return account;
};

export const updateAccount = async (updateData: Account) => {
  const account = await prisma.account.updateMany({
    where: { userId: updateData.userId, provider: updateData.provider },
    data: {
      refresh_token: updateData.refresh_token ?? null,
      refresh_expires_at: updateData.refresh_expires_at ?? null,
      access_token: updateData.access_token ?? null,
      expires_at: updateData.expires_at ?? null,
      scope: updateData.scope
    }
  });
  return account;
};

export const createOrUpdateAccount = async (accountData: Account) => {
  if (!accountData.userId || !accountData.provider) {
    console.log('Account missing info');
    console.log('UserId:', accountData?.userId);
    console.log('Provider:', accountData?.provider);
    return;
  }

  try {
    console.log('Create or Update Account');
    console.log('UserId:', accountData?.userId);
    console.log('Provider:', accountData?.provider);
    console.log('------END------');

    const account = await prisma.account.upsert({
      where: {
        userId_provider: {
          userId: accountData.userId,
          provider: accountData.provider
        }
      },
      update: {
        ...accountData
      },
      create: {
        ...accountData
      }
    });

    return account;
  } catch (error: any) {
    console.log('Error! Unabled to create or update account!');
    console.log(error.message);
    console.log('UserId:', accountData?.userId);
    console.log('Provider:', accountData?.provider);
  }
};

export const deleteAccountProvider = async (userId: string, provider: string) => {
  const deletenAccount = await prisma.account.delete({
    where: {
      userId_provider: {
        userId: userId,
        provider: provider
      }
    }
  });

  return deletenAccount;
};

type UpdateUserSchema = {
  name?: string;
  emailVerified?: Date;
  image?: string;
  customer_id?: string;
  sub_id?: string;
  sub_type?: number;
  sub_time_range?: number;
  sub_time_created?: number;
  sub_current_start?: number;
  sub_current_end?: number;
  sub_status?: string;
};

export const updateUserInDb = async (userId: string, data: UpdateUserSchema) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { ...data }
  });
  return user;
};
