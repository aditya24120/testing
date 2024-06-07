import axios from 'axios';
//google
import { google } from 'googleapis';
import {
  TLocalStorageInstagramToken,
  TLocalStorageTiktokToken,
  TLocalStorageYouTubeToken
} from '../types/types';
const service = google.youtube('v3');

var OAuth2 = google.auth.OAuth2;
const YOUTUBE_SECRETS = JSON.parse(process.env.YOUTUBE_SECRETS || '{}');

const makeAuthorizedClient = (youtubeToken: TLocalStorageYouTubeToken) => {
  let clientSecret = YOUTUBE_SECRETS.web.client_secret;
  let clientId = YOUTUBE_SECRETS.web.client_id;
  let redirectUrl = YOUTUBE_SECRETS.web.redirect_uris[0];
  let oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  oauth2Client.credentials = youtubeToken;
  return oauth2Client;
};

export const getTiktokUsername = async (tiktokToken: TLocalStorageTiktokToken) => {
  const body = {
    open_id: tiktokToken.open_id,
    access_token: tiktokToken.access_token,
    fields: ['display_name']
  };
  let url = `https://open-api.tiktok.com/user/info/`;
  let response = await axios
    .post(url, body, { headers: { 'Content-Type': 'application/json' } })
    .catch((e) => {
      console.log('caught rejection: ' + e);
      console.log(e?.response);
      throw new Error('tiktok hit failed');
    });
  const data = response.data;
  let username = data.data.user.display_name;
  console.log('tiktok username is: ' + username);

  return username;
};

export const getYoutubeUsername = async (youtubeToken: TLocalStorageYouTubeToken) => {
  // using service
  let client = makeAuthorizedClient(youtubeToken);
  console.log(client);
  try {
    let channelResponse = await service.channels.list({
      auth: client,
      part: ['snippet.title'],
      mine: true
    });
    let channel = channelResponse.data.items?.[0];
    return channel?.snippet?.title;
  } catch (e: any) {
    console.log('caught rejection: ' + e);
    console.log(e?.response);
    console.log(e?.response?.data?.error.errors);
    console.log(e?.response?.data?.error.details);
    throw new Error('youtube hit failed');
  }
};

export const getInstagramUsername = async (igToken: TLocalStorageInstagramToken) => {
  let url = `https://api.instagram.com/v1/users/self/?access_token=${igToken}`;
  let response = await axios.get(url);
  const data = response.data;
  console.log(data);
  return data.data.username;
};
const BASE_URL = 'https://graph.facebook.com/v15.0';
export const getInstagramBusinessUsername = async (token: string): Promise<string> => {
  try {
    const response = await axios.get(
      BASE_URL + '/me/accounts?fields=instagram_business_account{username}&access_token=' + token
    );
    const username = response.data?.data?.[0]?.instagram_business_account?.username;
    return username as string;
  } catch (error) {
    throw new Error('unable to get instgram login');
  }
};
