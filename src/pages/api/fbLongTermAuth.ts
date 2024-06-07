import type { NextApiRequest, NextApiResponse } from 'next';
const BASE_URL = 'https://graph.facebook.com/v13.0';
// const tempUserId = "17841445045171652";

const axios = require('axios');
const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const accessToken = req.query.accessToken;
  const URL =
    `${BASE_URL}/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${FB_APP_ID}&` +
    `client_secret=${FB_APP_SECRET}&` +
    `fb_exchange_token=${accessToken}`;

  console.log('getting ' + URL);
  try {
    const newAccessTokenBlob = await axios.get(URL);
    console.log('got: ', newAccessTokenBlob.data);

    const newAccessToken: string = newAccessTokenBlob.data;

    res.status(200).json({ name: 'fbLongTermAuthResponse', newAccessToken });
  } catch (e: unknown) {
    console.log('error: ', e);
    res.status(500).send({ name: 'fbLongTermAuthResponse', error: e });
  }
}
