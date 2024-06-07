const BASE_URL = 'https://graph.facebook.com/v15.0';
// const tempUserId = "17841445045171652";

const axios = require('axios');
let id; //"";
let pageId;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getUserID = async (accessToken) => {
  // const accessToken = getCurrentSettings().accessToken;
  const response = await axios.get(
    BASE_URL +
      '/me/accounts?fields=instagram_business_account{id, username}&access_token=' +
      accessToken
  );
  console.log(JSON.stringify(response.data));
  id = response.data?.data?.[0]?.instagram_business_account?.id;
  console.log('Got id: ', id);
  return id;
};

const getPageNameandId = async (accessToken) => {
  const response = await axios.get(
    `${BASE_URL}/me/accounts?fields=name&access_token=${accessToken}`
  );
  const { name, id } = response.data?.data?.[0];

  console.log(name, id);

  return { pageName: name, pageId: id };
};

const getFacebookPageAccessToken = async (accessToken, pageId) => {
  const response = await axios.get(
    `${BASE_URL}/${pageId}?fields=access_token&access_token=${accessToken}`
  );
  const pageAccessToken = response.data;
  return pageAccessToken.access_token;
};

const getInstagramUsername = async (accessToken) => {
  // const accessToken = getCurrentSettings().accessToken;
  const response = await axios.get(
    BASE_URL +
      '/me/accounts?fields=instagram_business_account{username}&access_token=' +
      accessToken
  );
  console.log(JSON.stringify(response.data));
  const username = response.data?.data?.[0]?.instagram_business_account?.username;
  console.log('Got id: ', username);
  return username;
};

const createMediaContainer = async (accessToken, downloadURL, caption) => {
  if (!id) {
    console.log('gettin id');
    let newId = await getUserID(accessToken);
    if (!newId) {
      throw new Error('Could not get id');
    }
  }

  const encodedCaption = caption?.replaceAll('#', '%23') || 'Uploaded with ClipbotTv';
  const videoLocation = downloadURL;
  console.log({ videoLocation });
  const mediaCreationURL = `${BASE_URL}/${id}/media?media_type=REELS&video_url=${encodeURIComponent(
    videoLocation
  )}&access_token=${accessToken}&caption=${encodedCaption}`;
  let response;
  try {
    response = await axios.post(mediaCreationURL);
  } catch (e) {
    console.log(e);
    console.log(e.response?.headers?.['www-authenticate']);
  }

  console.log('Response:', response?.data);
  return response?.data?.id;
};

const publishMediaContainer = async (accessToken, containerId) => {
  // const containerId = '17938803718939574';
  console.log('publishing');
  if (!id) {
    await getUserID(accessToken);
  }
  const mediaPublishURL = `${BASE_URL}/${id}/media_publish?creation_id=${containerId}&access_token=${accessToken}`;
  let response;
  try {
    response = await axios.post(mediaPublishURL);
  } catch (e) {
    console.log(e);
    console.log(e.response?.headers?.['www-authenticate']);
  }

  console.log('Response:', response?.data);
  return response;
};

const waitForVideoEdited = async (jobId) => {
  console.log('--waitForVideoEdite start--');
  // Not all vids need editing!
  if (jobId === 'none') {
    let key = localStorage.getItem('savedFileKey');
    let downloadURL = 'https://file.io/' + key;
    console.log('--waitForVideoEdite none--');
    return downloadURL;
  }

  const checkUploadStatusURL = `https://igisa.bitch.dev/status?id=${jobId}`;
  let status = '';
  let response;

  do {
    await sleep(1000);
    try {
      console.log('checking upload status');
      response = await axios.get(checkUploadStatusURL);
      console.log('--waitForVideoEdite response data--');
      console.log(response);
      console.log(response.data);
    } catch (e) {
      console.log(e);
      console.log(e.response?.headers);
    }
    status = response?.data?.status;
    console.log('Status: ', status);
  } while (status === 'processing');

  if (status == 'done') {
    return response.data.fileURL;
  } else {
    console.log('Final Status: ', status);
    console.log('Possible failed instagram video edit: ', response?.data, response?.status);
    throw new Error('Possible failed instagram video edit: ', response?.data);
  }
};

const waitForContainerUpload = async (accessToken, containerId) => {
  console.log('--waitForContainerUpload start--');
  const checkUploadStatusURL = `${BASE_URL}/${containerId}?fields=status_code,status&access_token=${accessToken}`;
  let status = '';
  let response;

  do {
    await sleep(1000);
    try {
      console.log('checking upload status');
      response = await axios.get(checkUploadStatusURL);
    } catch (e) {
      console.log(e);
      console.log(e.response?.headers?.['www-authenticate']);
    }
    status = response?.data?.status_code;
    console.log('--waitForContainerUpload IN_PROGRESS--');
    console.log('Response: ', response?.data);
    console.log('Status: ', status);
  } while (status === 'IN_PROGRESS');

  if (status == 'FINISHED') {
    console.log('--waitForContainerUpload FINISHED--');
    return containerId;
  } else {
    console.log('Final Status: ', status);
    console.log('Possible failed instagram upload: ', response?.data, response?.status);
    throw new Error('Possible failed instagram upload: ', response?.data);
  }
};

const checkRateLimit = async () => {
  if (!id) {
    await getUserID();
  }
  const rateLimitURL = `${BASE_URL}/${id}/content_publishing_limit?access_token=${tempAccessToken}`;

  let response;
  try {
    response = await axios.get(rateLimitURL);
  } catch (e) {
    console.log(e);
    console.log(e.response?.headers?.['www-authenticate']);
  }

  console.log('Response: ', response?.data);
  return response?.data?.content_publishing_limit;
};

const editVideoForIG = async (downloadURL) => {
  return axios.post('https://igisa.bitch.dev?fileURL=' + downloadURL).then((res) => {
    let jobId = res.data.id;
    return jobId;
  });
};

const doIGUpload = async (accessToken, downloadURL, caption) => {
  return createMediaContainer(accessToken, downloadURL, caption)
    .then((container) => waitForContainerUpload(accessToken, container))
    .then((container) => publishMediaContainer(accessToken, container));
};

const startFbUpload = async (accessToken, id) => {
  pageId = id;
  if (!pageId) {
    pageId = await getPageNameandId(accessToken);
  }
  const url = `${BASE_URL}/${pageId}/video_reels?upload_phase=start&access_token=${accessToken}`;
  let response;
  try {
    response = await axios.post(url);
  } catch (e) {
    console.log(e);
  }

  console.log('Response:', response?.data);
  return response.data;
};

const uploadVideoToFb = async (pageAccessToken, downloadUrl, startUpload) => {
  if (!startUpload.upload_url) throw new Error('video upload Url not found');
  const baseUrl = startUpload.upload_url;
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      // mode: 'no-cors',
      headers: {
        Authorization: `OAuth ${pageAccessToken}`,
        file_url: downloadUrl,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      }
    });

    const body = await response.json();

    return body;
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

const waitForFbUpload = async (pageAccessToken, videoId) => {
  if (!videoId) throw new Error('invalid video id');
  const url = `${BASE_URL}/${videoId}?fields=status`;
  // not_started, in_progress, complete, error

  let uploadStatus = '';
  let response;

  do {
    await sleep(1000);
    try {
      response = await axios.get(url, {
        headers: { Authorization: `OAuth ${pageAccessToken}` }
      });
    } catch (e) {
      console.log(e);
    }
    uploadStatus = response?.data?.status?.['uploading_phase']?.['status'];
  } while (uploadStatus === 'in_progress');

  if (uploadStatus === 'complete') {
    return videoId;
  } else {
    console.log('Final Status: ', uploadStatus);
    console.log(
      'Possible failed fb upload: ',
      response?.data,
      response?.data?.['uploading_phase']?.['status']
    );
    throw new Error('Possible failed facebook wait upload: ', response?.data);
  }
};

//used for debugging
const checkFBStatus = async (pageAccessToken, videoId) => {
  const url = `${BASE_URL}/${videoId}?fields=status`;
  try {
    console.log('checking upload status');
    const response = await axios.get(url, {
      headers: { Authorization: `OAuth ${pageAccessToken}` }
    });
    console.log('ResponseStatus: ', response?.data?.status?.['uploading_phase']?.['status']);
    console.log('ResponseStatus: ', response?.data?.status?.['processing_phase']);
    console.log('ResponseStatus: ', response?.data?.status?.['publishing_phase']);
    return response.data.status;
  } catch (e) {
    console.log(e);
    throw new Error('unable to get fb status');
  }
};

const publishFbVideo = async (pageAccessToken, id, videoId, description) => {
  pageId = id;

  if (!pageId) {
    pageId = await getPageNameandId(pageAccessToken);
    console.log({ pageId });
  }
  const url = `${BASE_URL}/${pageId}/video_reels?upload_phase=finish&access_token=${pageAccessToken}`;
  const fields = `&video_id=${videoId}&video_state=PUBLISHED&description=${description}`;
  const fullUrl = url + fields;
  console.log({ fullUrl });
  try {
    const res = await axios.post(fullUrl);
    return res.data;
  } catch (error) {
    console.log(error?.response?.data);
    throw new Error(JSON.stringify(error?.response?.data?.error));
  }
};

const doFbUpload = async (pageAccessToken, id, downloadUrl, description) => {
  try {
    console.log({ pageAccessToken, pageId: id, downloadUrl });

    const startUpload = await startFbUpload(pageAccessToken, id);
    console.log('FinsihedUpload', { startUpload });

    const uploadFbVideo = await uploadVideoToFb(pageAccessToken, downloadUrl, startUpload);
    console.log('FinishUploadFBVideo', { uploadFbVideo });

    const checkStatus = await waitForFbUpload(pageAccessToken, startUpload.video_id);
    console.log('FinishCheckStatus', { checkStatus });
    const publish = await publishFbVideo(pageAccessToken, id, startUpload.video_id, description);

    return { publish, checkStatus, videoId: startUpload.video_id };
  } catch (error) {
    console.log(error.message);
    throw new Error(error);
  }
};

module.exports = {
  getUserID,
  doIGUpload,
  getInstagramUsername,
  editVideoForIG,
  getPageNameandId,
  doFbUpload,
  getFacebookPageAccessToken
};
