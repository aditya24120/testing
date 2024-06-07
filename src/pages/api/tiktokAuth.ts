import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';
const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const THIS_SERVER = process.env.BASE_URL;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const rUrl = req?.query?.redirectUrl;
  const redirectEnd = rUrl ? (Array.isArray(rUrl) ? rUrl[0] : rUrl) : 'clips/upload';
  const redirectUrl = `https://app.clipbot.tv/${redirectEnd}`;
  console.log('redirectURL: ', redirectUrl);
  const csrfState = Math.random().toString(36).substring(7);
  res.setHeader('Set-Cookie', serialize('csrfState', csrfState, { path: '/' }));

  let url = 'https://open-api.tiktok.com/platform/oauth/connect/';

  url += `?client_key=${CLIENT_KEY}`;
  url += '&scope=video.upload';
  url += '&response_type=code';
  url += `&redirect_uri=${encodeURI(redirectUrl || '')}`;
  url += '&state=' + csrfState;

  res.redirect(url);
}
