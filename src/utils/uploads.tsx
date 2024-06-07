import axios from 'axios';
import { ToSend } from '../types/types';
import { doFbUpload, doIGUpload } from './facebook';

const tiktokEndpoint = '/api/tiktokUpload';
const youtubeEndpoint = '/api/youtubeUpload';
const youtubeRefreshEndpoint = '/api/youtubeRefresh';
const tiktokRefreshEndpoint = '/api/tiktokRefresh';

export const tiktokUpload = (toSend: Record<string, any>) => {
  return axios.post(tiktokEndpoint, toSend);
};

export const refreshTikTokToken = async (refresh_token: string) => {
  let newTokenBlob = await axios.get(tiktokRefreshEndpoint + '?token=' + refresh_token);
  let newToken = newTokenBlob.data;
  return newToken;
};

export const refreshYoutubeToken = async (token: Object) => {
  let newTokenBlob = await axios.post(youtubeRefreshEndpoint, token);
  let newToken = newTokenBlob.data.token;
  return newToken;
};

export const youtubeUpload = async (toSend: Record<string, any>) => {
  const upload = await axios.post(youtubeEndpoint, toSend);
  return upload.data;
};

export const IGUpload = (toSend: Record<string, any>) => {
  console.log('file stored');
  const singleUseDownloadURL = toSend.fileURL;
  const formDataToken = toSend.igToken;
  console.log(formDataToken);
  const accessToken = formDataToken.access_token;
  const caption = toSend.caption;
  // let igEditJobId = localStorage.getItem('jobId');
  return doIGUpload(accessToken, singleUseDownloadURL, caption);
};
