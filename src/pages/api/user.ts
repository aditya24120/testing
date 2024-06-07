import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { getUserByEmailWithTwitch } from '../../libs/prisma/user';

export default async function user(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession({ req });
    if (!session || !session.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = await getUserByEmailWithTwitch(session.user.email!, true);

    res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).end('Authentication token is invalid, please log in');
  }
}
