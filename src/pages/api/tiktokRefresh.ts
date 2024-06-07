import type { NextApiRequest, NextApiResponse } from 'next';
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;

export default async function tiktokRefresh(req: NextApiRequest, res: NextApiResponse) {
  const refresh_token = req.query.token as string;

  let url_refresh_token = 'https://open-api.tiktok.com/oauth/refresh_token/';
  url_refresh_token += '?client_key=' + TIKTOK_CLIENT_KEY;
  url_refresh_token += '&grant_type=refresh_token';
  url_refresh_token += '&refresh_token=' + refresh_token.replace(/#/g, '%23');

  fetch(url_refresh_token, { method: 'post' })
    .then((res) => res.json())
    .then((json) => {
      res.send(json?.data);
    });
}
