import { NextApiRequest, NextApiResponse } from 'next';

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  let url_access_token = 'https://open-api.tiktok.com/oauth/access_token/';
  url_access_token += '?client_key=' + CLIENT_KEY;
  url_access_token += '&client_secret=' + CLIENT_SECRET;
  url_access_token += '&code=' + code;
  url_access_token += '&grant_type=authorization_code';

  fetch(url_access_token, { method: 'post' })
    .then((result) => result.json())
    .then((json) => {
      //   res.cookie('clipbot_tiktok_sessionid', json?.data);
      const tiktokSessionId = json?.data;
      res.status(200).send({ name: 'tiktokAuth', tiktokSessionId });
    });
}
