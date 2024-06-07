// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import { google } from 'googleapis';
var OAuth2 = google.auth.OAuth2;
const YOUTUBE_SECRETS = JSON.parse(process.env.YOUTUBE_SECRETS || '{}');
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

const makeClient = (credentials: Object) => {
  var clientSecret = YOUTUBE_SECRETS.web.client_secret;
  var clientId = YOUTUBE_SECRETS.web.client_id;
  var redirectUrl = YOUTUBE_SECRETS.web.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  oauth2Client.setCredentials(credentials);
  return oauth2Client;
};

export const refreshYoutubeToken = async (credentials: any) => {
  if (!credentials.refresh_token) {
    return { isRejected: true, error: 'No refresh token set' };
  }
  var oauth2Client = makeClient(credentials);
  let clientToken = new Promise((resolve, reject) => {
    oauth2Client.refreshAccessToken(async function (err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        reject(err);
        return;
      }
      if (token == null) {
        console.log('bad token');
        reject(
          'Looks like you may have put in a bad token: <br> ' +
            token +
            ' <br> Please try logging in to YouTube again'
        );
        return;
      } else {
        console.log('setting new token:' + JSON.stringify(token));
      }
      oauth2Client.credentials = token;
      resolve(token);
    });
  });

  let finalToken = await clientToken.catch((e) => {
    console.log('caught rejection: ' + e);
    return { isRejected: true, error: e.message };
  });
  //@ts-ignore
  if (finalToken.isRejected) {
    console.log('rip token s', finalToken);
    return finalToken;
  }

  console.log('got client tokeN:' + JSON.stringify(finalToken));

  return finalToken;
};

type Data = {
  name: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  //youtubeRefresh
  const youtubeToken = req.body;
  try {
    const refreshedToken = await refreshYoutubeToken(youtubeToken);
    res.status(200).json({ name: 'refreshedYoutubeToken', token: refreshedToken } as Data);
  } catch (error) {
    console.log('token error');
    res.status(500).json({ name: 'refreshYoutubeToken', message: 'something went wrong' } as Data);
  }
}
