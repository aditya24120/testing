import { useState } from 'react';
import { Clip } from '@prisma/client';
import { FaYoutube, FaTiktok, FaFacebookSquare } from 'react-icons/fa';
import TimeAgo from 'react-timeago';
import PreviewModal from '../dashboard/PreviewModal';
import { ClipData } from '../crop/VideoPreview';
import { FiInstagram } from 'react-icons/fi';
import { CropSettings, TCropData, TCropType } from '../../types/types';
import SecondaryButton from '../common/SecondaryButton';

export const trimEllip = (title: string) => {
  const maxLength = 25;
  let newTitle = title;
  if (newTitle.length > maxLength) {
    newTitle = newTitle.substring(0, maxLength).trim();
    newTitle += '...';
  }

  return newTitle;
};

type ClipsListItemProps = {
  clip: Clip;
  scheduled?: boolean;
  cancelScheduledClip?: (videoId: string, twitch_id: string) => void;
};

const ClipsListItem = ({ clip, scheduled = false, cancelScheduledClip }: ClipsListItemProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const includesYouTube =
    clip.uploadPlatforms.includes('YouTube') || clip.uploadPlatforms.includes('youtube');
  const includesTiktok =
    clip.uploadPlatforms.includes('TikTok') || clip.uploadPlatforms.includes('tiktok');
  const includesInstagram =
    clip.uploadPlatforms.includes('Instagram') || clip.uploadPlatforms.includes('instagram');
  const includesFacebook =
    clip.uploadPlatforms.includes('Facebook') || clip.uploadPlatforms.includes('facebook');

  const cropSettings = (crop: CropSettings) => {
    return {
      x: crop.x,
      y: crop.y,
      width: crop.width,
      height: crop.height,
      scaleX: crop.scaleX || undefined,
      scaleY: crop.scaleY || undefined,
      isNormalized: crop.isNormalized
    };
  };

  const cropDataInput = clip.cropData as TCropData;

  const cropData: ClipData = {
    cropType: cropDataInput?.cropType as NonNullable<TCropType>,
    startTime: cropDataInput.startTime ?? undefined,
    endTime: cropDataInput.endTime ?? undefined,
    camCrop: cropDataInput.camCrop ? cropSettings(cropDataInput.camCrop) : undefined,
    screenCrop: cropSettings(cropDataInput.screenCrop!)
  };

  return (
    <>
      <div className="grid items-center rounded-sm border-b p-2 hover:bg-grey-100 md:grid-cols-6 md:justify-between ">
        <TimeAgo
          date={scheduled ? clip.scheduledUploadTime || new Date() : clip.uploadTime || new Date()}
          className="text-sm font-light text-gray-400 md:text-base"
        />
        <div className={`${scheduled ? 'col-span-2' : 'col-span-3'} flex items-center gap-2`}>
          <div>
            <h3
              onClick={() => setShowPreview(!showPreview)}
              className="text-left text-base text-violet hover:cursor-pointer md:text-xl"
            >
              {trimEllip(clip.youtubeTitle || clip.caption || clip.title)}
            </h3>
            <a
              href={`https://clips.twitch.tv/${clip.twitch_id}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-400 md:text-sm"
            >
              {trimEllip(clip.twitch_id)}
            </a>
          </div>
        </div>

        <div
          className={`${
            scheduled
              ? 'col-start-3 md:col-span-2 md:col-start-4'
              : 'col-start-3 md:col-span-2 md:col-start-5'
          } row-start-1 flex items-center justify-center gap-1 md:gap-3`}
        >
          <FaYoutube className={`h-10 w-10 text-red-500 ${!includesYouTube && 'grayscale'}`} />
          <FaTiktok className={`h-7 w-7 text-black ${!includesTiktok && 'opacity-30'}`} />
          <FiInstagram className={`h-8 w-8 text-pink-400 ${!includesInstagram && 'grayscale'}`} />
          <FaFacebookSquare
            className={`h-8 w-8 text-sky-500 ${!includesFacebook && 'grayscale'}`}
          />
        </div>

        {scheduled && (
          <div className="col-span-3 row-start-3 flex flex-col items-center md:col-span-1  md:col-start-6  md:row-start-1">
            <SecondaryButton onClick={() => cancelScheduledClip?.(clip.id, clip.twitch_id)}>
              Cancel
            </SecondaryButton>
          </div>
        )}
      </div>

      <PreviewModal
        modalOpen={showPreview}
        closeModal={setShowPreview}
        clipUrl={clip.downloadUrl}
        cropData={cropData}
        clipTitle={clip.youtubeTitle || clip.caption || clip.title}
      />
    </>
  );
};

export default ClipsListItem;
