import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { getUserByIdWithTwitch } from '../../libs/prisma/user';

export default async function newUserQueue(req: NextApiRequest, res: NextApiResponse) {
  const cropServerUrl = process.env.NEXT_PUBLIC_CROP_VIDEO_URL;
  const cropApp = process.env.NEXT_PUBLIC_CROP_APP_KEY;

  if (req.method === 'POST') {
    try {
      const { userId }: { userId: string } = req.body;
      if (!userId) return res.status(400).json({ error: 'BAD_REQUEST' });

      const user = await getUserByIdWithTwitch(userId);
      if (!user) return res.status(403).json({ error: 'FORBIDDEN' });

      console.log('user from api: ', user);
      const broadcasterId = user.accounts[0].providerAccountId;
      if (!broadcasterId) return res.status(403).json({ error: 'FORBIDDEN' });

      await axios.post(
        cropServerUrl + '/user/newUserQueue',
        { userId, broadcasterId },
        {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer: ${cropApp}` }
        }
      );
      res.status(200).json({ message: 'success' });
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
      }
      res.status(500).end('Something went wrong!');
    }
  }
  // HTTP method not supported!
  else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `HTTP method ${req.method} is not supported.` });
  }
}
