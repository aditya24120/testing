import { NextApiRequest, NextApiResponse } from 'next';
import { getTiktokUsername } from '../../../utils/username';
import { TLocalStorageTiktokToken } from '../../../types/types';

export default async function TikTokUsername(req: NextApiRequest, res: NextApiResponse) {
  const token = req.query.tiktokToken;
  const tiktokToken = Array.isArray(token) ? token[0] : token;
  if (!tiktokToken) return res.status(400).json({ error: 'Invalid token' });

  const parsedToken: TLocalStorageTiktokToken = JSON.parse(tiktokToken);

  console.log('tiktok token is: ' + JSON.stringify(parsedToken));
  if (!tiktokToken) return res.status(400).json({ name: 'tiktokTokenRequired' });

  const username = await getTiktokUsername(parsedToken);

  res.status(200).json({ name: 'tiktokUsernameResponse', username });
}
