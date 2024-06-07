import { NextApiRequest, NextApiResponse } from 'next';
import { getInstagramUsername } from '../../../utils/facebook';

export default function InstagramUsername(req: NextApiRequest, res: NextApiResponse) {
  const token = req?.query?.token;
  if (!token) return res.status(400).json({ name: 'tokenRequired' });

  getInstagramUsername(token).then((result) => {
    res.status(200).json({ name: 'instagramUsernameResponse', username: result });
  });
}
