import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
var OAuth2 = google.auth.OAuth2;
const YOUTUBE_SECRETS = JSON.parse(process.env.YOUTUBE_SECRETS);
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

const makeClient = (redirectUrl: string) => {
  var clientSecret = YOUTUBE_SECRETS.web.client_secret;
  var clientId = YOUTUBE_SECRETS.web.client_id;
  var redirectUrl = `${process.env.BASE_URL}${redirectUrl}`;
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
  return oauth2Client;
};

export const loginToYoutube = async (redirectUrl = 'clips/upload', code?: string | null) => {
  console.log('youtube login initiated');
  var oauth2Client = makeClient(redirectUrl);

  //@ts-ignore
  // window.location = '/api/youtubeInitialAuth';
  async function authorize(oauth2Client, doGetAuthURL = true) {
    // Check if we have previously stored a token.
    // try {
    //   let code = currentToken;
    //   if (code == '') {
    //     throw new Error('Unauthorized to youtube, token:' + code);
    //   }
    //   oauth2Client.credentials = code;
    //   return { authorized: true, client: oauth2Client };
    // }
    // catch (e) {
    console.log('We are not currently authed to youtube and need to auth:');
    if (doGetAuthURL) {
      let authURL = getNewToken(oauth2Client);
      return { authorized: false, authURL: authURL, client: oauth2Client };
    } else {
      return { authorized: false, client: oauth2Client };
    }
    // }
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   *
   * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
   *     client.
   */
  function getNewToken(oauth2Client: any) {
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url: ', authUrl);
    return authUrl;
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   *
   * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
   *     client.
   */
  const getActualYoutubeToken = async (
    oauth2Client: OAuth2Client,
    code: string,
    isRefresh = false
  ) => {
    let clientToken = new Promise((resolve, reject) => {
      if (!isRefresh) {
        oauth2Client.getToken(code, async function (err, token) {
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
      } else {
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
      }
    });

    let finalToken = await clientToken.catch((e) => {
      console.log('caught rejection: ' + e);
      return { isRejected: true, error: e };
    });
    //@ts-ignore
    if (finalToken.isRejected) {
      console.log('rip token s', finalToken);
      return finalToken;
    }

    console.log('got client tokeN:' + JSON.stringify(finalToken));

    return {
      client: oauth2Client,
      token: finalToken,
    };
  };

  if (code) {
    let token = await getActualYoutubeToken(oauth2Client, code, false);
    console.log('got token:' + JSON.stringify(token));
    return token;
  } else {
    return authorize(oauth2Client, true).then((result) => {
      return result?.authURL;
    });
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req?.query?.code;
  const url = req?.query?.redirectUrl;
  const redirectUrl = Array.isArray(url) ? url[0] : url;

  //@ts-ignore
  if (!code) {
    let authURL = await loginToYoutube(redirectUrl);
    res.redirect(authURL);
  } else {
    //@ts-ignore
    let token = await loginToYoutube(redirectUrl, code);
    //@ts-ignore
    res.status(200).json({ name: 'youtubeTokenAuthResponse', token });
  }
}
