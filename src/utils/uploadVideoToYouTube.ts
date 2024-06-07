import { google, Auth } from 'googleapis';
import { Clip } from '../types/types';

const service = google.youtube('v3');
import { stream2buffer, bufferToStream } from './streamUtils';
import got from 'got';
import { removeEmojis } from './emoji';

const youtubeCategoriesToIds: Record<string, number> = {
  'Film & Animation': 1,
  'Autos & Vehicles': 2,
  Music: 10,
  'Pets & Animals': 15,
  Sports: 17,
  'Short Movies': 18,
  'Travel & Events': 19,
  Gaming: 20,
  Videoblogging: 21,
  'People & Blogs': 22,
  Comedy: 23,
  Entertainment: 24,
  'News & Politics': 25,
  'Howto & Style': 26,
  Education: 27,
  'Science & Technology': 28,
  'Nonprofits & Activism': 29
};
type CurrentClip = {
  title?: string;
  description?: string;
  category?: string;
  privacy?: string;
  youtubePrivacy?: string;
  youtubeCategory?: string;
  youtubeDescription?: string;
  clipURL: string;
};

export async function uploadVideoToYoutube(auth: Auth.OAuth2Client, currentClip: CurrentClip) {
  let privacy = currentClip?.youtubePrivacy || currentClip?.privacy || 'private';
  let adjustedTitle = currentClip?.title || 'ClipbotTV video';
  console.log('YOUTUBE TITLE: ', adjustedTitle);
  console.log('TITLE LENGTH: ', adjustedTitle.length);
  const category = (currentClip?.youtubeCategory || currentClip?.category) as string;
  const fileStream = got.stream(currentClip?.clipURL);
  const getBuffer = await stream2buffer(fileStream);
  const finalStream = bufferToStream(getBuffer);

  // console.log(Object.keys(fileStream.body));
  const upload = new Promise((resolve, reject) => {
    console.log('trying to upload');
    google.options({
      headers: {
        Slug: `${removeEmojis(adjustedTitle)}.mp4`
      }
    });

    service.videos.insert(
      {
        auth: auth,
        part: ['snippet', 'contentDetails', 'status'],
        requestBody: {
          // Video title and description
          snippet: {
            title: adjustedTitle,
            description:
              currentClip?.youtubeDescription || currentClip?.description || 'Video Description',
            categoryId: category ? youtubeCategoriesToIds[category].toString() : '20'
          },
          // I set to public because we're in prod!
          status: {
            privacyStatus: privacy
          }
        },
        // Create the readable stream to upload the video
        media: {
          body: finalStream,
          mimeType: 'video/mp4'
        }
      },
      (error, data) => {
        if (error) {
          console.log('error uploading');
          console.dir(error.message, { depth: null });
          reject(error);
          return;
        }

        console.log('upload complete');
        console.dir({ data: data?.data }, { depth: null });
        resolve('https://www.youtube.com/watch?v=' + data?.data?.id);
        return;
      }
    );
  });

  let finalUpload = await upload.catch((e) => {
    console.log('caught rejection: ', e);
    return { isRejected: true, message: e.message };
  });
  //@ts-ignore
  if (finalUpload.isRejected) {
    console.log('upload failed', finalUpload);
    return finalUpload;
  }

  return finalUpload;
}
