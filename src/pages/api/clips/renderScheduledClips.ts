import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

import { prisma } from '../../../libs/prisma/client';
import { waitForVideoCrop } from '../../../utils/cropEdit';
import { Clip } from '@prisma/client';

function addHours(numOfHours: number, date = new Date(new Date().toUTCString())) {
  date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
  return date;
}

export default async function renderScheduledClips(req: NextApiRequest, res: NextApiResponse) {
  // check if request authorization header
  if (!req.headers.authorization) return res.status(400).end();
  // check if authorization token
  const ACTION_KEY = req.headers.authorization.split(' ')[1];
  if (!ACTION_KEY) return res.status(400).json({ error: 'Invalid headers' });

  const APP_KEY = process.env.NEXT_PUBLIC_CROP_APP_KEY;
  if (!APP_KEY) return res.status(500).send('Internal server error 001');
  // check if valid token
  if (ACTION_KEY !== APP_KEY) return res.status(401).end();

  const CROP_URL = process.env.NEXT_PUBLIC_CROP_VIDEO_URL;
  if (!CROP_URL) return res.status(500).send('Internal server error 002');

  if (req.method === 'GET') {
    try {
      // get all clips schedueled where time is < now
      const scheduledClips = await prisma.clip.findMany({
        where: {
          uploaded: false,
          status: 'SCHEDULED',
          scheduledUploadTime: { lte: addHours(1) },
          AND: [{ NOT: { scheduledUploadTime: null } }]
        }
      });

      if (scheduledClips.length !== 0) {
        const response = await axios.post(
          `${CROP_URL}/schedule`,
          {
            scheduledClips
          },
          {
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer: ${APP_KEY}` }
          }
        );
      }

      res.json({ count: scheduledClips.length, message: 'rending clips', clips: scheduledClips });
    } catch (e: any) {
      console.error('renderScheduledClips', e);
      res.status(500).json({ message: 'Something went wrong 003', error: e.message });
    }
    // POST request
  } else if (req.method === 'POST') {
    const { clip, failed }: { clip: Clip; failed: boolean } = req.body;
    if (!clip) return res.status(400).send('No clip provided');
    console.log('Update clip', clip.id);
    try {
      const updateRenderedVideo = await prisma.clip.update({
        where: {
          id: clip.id
        },
        data: { renderedUrl: clip.renderedUrl, status: failed ? 'FAILED_TO_RENDER' : 'RENDERED' }
      });
      res.status(200).send(`${updateRenderedVideo?.twitch_id} updated`);
    } catch (e: any) {
      res.status(500).json({ message: 'Something went wrong', error: e.message });
    }
  }
  // HTTP method not supported!
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `HTTP method ${req.method} is not supported.` });
  }
}
