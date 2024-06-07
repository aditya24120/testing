import { NextApiRequest, NextApiResponse } from 'next';
import { Account } from '../../../types/types';
import { getSession } from 'next-auth/react';
import {
  createOrUpdateAccount,
  getUserByEmailWithAllAccounts,
  updateAccount,
} from '../../../libs/prisma/user';

export default async function updateDefaultCrop(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  if (req.method === 'GET') {
    try {
      const userWithAccounts = await getUserByEmailWithAllAccounts(session.user?.email!);
      if (!userWithAccounts) return res.status(404).send('user not found');
      let accounts = userWithAccounts.accounts;
      res.json(userWithAccounts.accounts);
    } catch (e) {
      res.status(500).json({ message: 'Something went wrong', error: e });
    }
  } else if (req.method === 'POST') {
    const data: Account = req.body;
    console.log('DataPostAccount:', data);
    try {
      const user = await getUserByEmailWithAllAccounts(session.user?.email!);
      if (!user) return res.status(401).json({ error: 'Unauthorized -P' });
      const newAccount = createOrUpdateAccount({ ...data, userId: user.id });
      console.log('account created');
      res.json(newAccount);
    } catch (e) {
      res.status(500).json({ message: 'Something went wrong', error: e });
    }
  } else if (req.method === 'PATCH') {
    const data = req.body;
    try {
      const updatedAccount = updateAccount(data);
      console.log('account update');
      res.json(updatedAccount);
    } catch (e) {
      res.status(500).json({ message: 'Something went wrong', error: e });
    }
  }
  // HTTP method not supported!
  else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    res.status(405).json({ message: `HTTP method ${req.method} is not supported.` });
  }
}
