import axios from 'axios';

const cropUrl = process.env.NEXT_PUBLIC_CROP_VIDEO_URL;

type TRender = {
  fileURL: string;
  key: string;
  status: string;
};

type GetRenderedResponse = {
  data: TRender;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const waitForVideoCrop = async (jobId: string) => {
  const checkUploadStatusURL = `${cropUrl}/crop/status?id=${jobId}`;
  let status = '';
  let response;

  do {
    await sleep(1000);
    try {
      console.log('checking upload status');
      response = await axios.get(checkUploadStatusURL);
    } catch (e) {
      console.log(e);
    }
    status = response?.data?.status;
    console.log('Status: ', status);
  } while (status === 'processing');

  if (status == 'done') {
    return response?.data.key;
  } else {
    console.log('Final Status: ', status);
    console.log('Possible failed  video crop: ', response?.data, response?.status);
  }
};
