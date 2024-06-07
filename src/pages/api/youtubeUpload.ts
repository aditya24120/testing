import { google } from 'googleapis';
import { NextApiRequest, NextApiResponse } from 'next';
import { uploadVideoToYoutube } from '../../utils/uploadVideoToYouTube';

var OAuth2 = google.auth.OAuth2;
const YOUTUBE_SECRETS = JSON.parse(process.env.YOUTUBE_SECRETS || '{}');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('youtube upload');
  console.log(req?.body);
  const youtubeToken = req.body?.youtubeToken;
  const currentClip = req.body?.clip || {
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    privacy: req.body.privacy
  };
  Object.keys(req.body).forEach((field) => {
    currentClip[field] = req.body[field];
  });
  if (!req?.body?.fileURL) {
    return res.status(400).send('No files were uploaded.');
  }

  let clientSecret = YOUTUBE_SECRETS.web.client_secret;
  let clientId = YOUTUBE_SECRETS.web.client_id;
  let redirectUrl = YOUTUBE_SECRETS.web.redirect_uris[0];
  let oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  currentClip.clipURL = req?.body?.fileURL;
  oauth2Client.credentials = youtubeToken;

  try {
    const output = await uploadVideoToYoutube(oauth2Client, currentClip);

    res.status(200).send({ youtubePayload: output });
  } catch (error: any) {
    res.status(400).json({ rejected: true, message: error.message });
  }
}
