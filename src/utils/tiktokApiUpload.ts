import axios from 'axios';
import got from 'got';

import util from 'util';
import { stream2buffer, bufferToStream } from './streamUtils';

import type { Account } from '../types/types';

export async function tiktokAPIUpload(tiktokAuth: Account, fileURL: string) {
  const tiktokSession = tiktokAuth;
  if (!tiktokSession) {
    throw new Error('No tiktok session found');
  }

  console.log('Creating file object from stream');

  console.log('File URL: ', fileURL);
  const fileReq = got.stream(fileURL);

  const fileBuffer = await stream2buffer(fileReq);
  console.log('file req to buffer done');
  const fileStream = bufferToStream(fileBuffer);
  console.log('buffer to stream done');

  const fileSizeBytes = fileBuffer.byteLength;
  console.log('File size: ', {
    fileSizeBytes
  });

  console.log('Initializing upload to TikTok with init API');
  const initAPIResponse = await axios({
    method: 'POST',
    url: TIKTOK_UPLOAD_INIT_URL,
    headers: {
      Authorization: `Bearer ${tiktokSession.access_token}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    data: {
      source: 'FILE_UPLOAD',
      video_size: fileSizeBytes,
      chunk_size: fileSizeBytes,
      total_chunk_count: 1
    }
  }).catch((error) => {
    if (error.response) {
      // Request made and server responded
      console.log(util.inspect(error.response.data));
      console.log(util.inspect(error.response.status));
      console.log(util.inspect(error.response.headers));

      console.log(util.inspect(error.response));
    } else if (error.request) {
      // The request was made but no response was received
      console.log(util.inspect(error.request));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

    console.error('Error initializing upload with TikTok: ' + util.inspect(error));
    throw error;
  });

  const receivedUploadURL = initAPIResponse?.data?.data?.upload_url;

  // early return if no upload_url provided from TikTok init API
  if (!receivedUploadURL) {
    console.error('Aborting TikTok upload due to upload init error');
    console.log(util.inspect(initAPIResponse?.data));
    console.log(util.inspect(initAPIResponse?.data?.error));

    throw new Error('Aborting TikTok upload due to upload init error');
  }

  console.log('Ready to upload file to ', receivedUploadURL);

  // perform upload to provided URL from the init upload API
  const uploadResponse = await axios({
    method: 'PUT',
    url: receivedUploadURL,
    data: fileStream,
    headers: {
      'Content-Length': fileSizeBytes,
      'Content-Range': `bytes 0-${fileSizeBytes - 1}/${fileSizeBytes}`,
      'Content-Type': 'video/mp4'
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  }).catch((error) => {
    if (error.response) {
      // Request made and server responded
      console.log(util.inspect(error.response.data));
      console.log(util.inspect(error.response.status));
      console.log(util.inspect(error.response.headers));

      console.log(util.inspect(error.response));
    } else if (error.request) {
      // The request was made but no response was received
      console.log(util.inspect(error.request));
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }

    console.error('Error uploading file to TikTok: ' + util.inspect(error));
    throw error;
  });

  console.log('Successfully uploaded to TikTok: ', uploadResponse);
  return uploadResponse.data;
}

const TIKTOK_UPLOAD_INIT_URL = 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/';
