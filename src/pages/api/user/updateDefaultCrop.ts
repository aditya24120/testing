import { NextApiRequest, NextApiResponse } from 'next';
import { CropSettings } from '../../../types/types';
import { getSession } from 'next-auth/react';
import { getUserByEmailWithTwitch } from '../../../libs/prisma/user';

export default async function updateDefaultCrop(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const {
        cropType,
        cropSize,
      }: { cropType: string; cropSize: { camCrop?: CropSettings; screenCrop?: CropSettings } } =
        req.body;
      if (!cropType || !cropSize) return res.status(400).json({ error: 'Invalid data' });

      const session = await getSession({ req });
      if (!session || typeof session === 'string')
        return res.status(401).json({ error: 'Unauthorized' });

      const user = await getUserByEmailWithTwitch(session.user?.email!);
      if (!user) return res.status(404).json({ message: 'User not found' });

      //TODO update default crop settings
      // const updatedUser = await updateUserDefaultCrop(user, {
      //   cropType,
      //   cropSize,
      // });
      res.json({ message: 'success' });
    } catch (e: any) {
      res.status(500).json({ message: 'Something went wrong', error: e.message });
    }
  }
  // HTTP method not supported!
  else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `HTTP method ${req.method} is not supported.` });
  }
}
