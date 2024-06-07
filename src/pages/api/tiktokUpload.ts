import { NextApiRequest, NextApiResponse } from 'next';
import { tiktokAPIUpload } from '../../utils/tiktokApiUpload';
import util from 'util';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(JSON.stringify(req?.body || {}));

  const tiktokToken = req.body?.tiktokSessionId;
  const fileURL = req?.body?.fileURL;

  try {
    const output = await tiktokAPIUpload(tiktokToken, fileURL);
    res.status(200).send({ tiktokPayload: output });
  } catch (error: any) {
    console.error('Upload to tiktok request failed: ' + util.inspect(error));

    if (error.response?.data?.error?.code == 'spam_risk_too_many_pending_share') {
      return res.status(400).send({ message: 'TikTok upload limit reached!' });
    }

    if (error.response?.data?.error?.message) {
      return res.status(500).send({ message: error.response.data.error.message });
    }

    return res.status(500).json(error);
  }
}
