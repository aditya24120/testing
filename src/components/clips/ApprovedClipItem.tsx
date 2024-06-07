import { CropTemplate, TwitchClip } from '@prisma/client';
import { useState } from 'react';
import { FaFacebookSquare, FaTiktok, FaYoutube } from 'react-icons/fa';
import { FiInstagram } from 'react-icons/fi';
import { CropSettings, UserSettings } from '../../types/types';
import PreviewModal from '../dashboard/PreviewModal';
import { trimEllip } from './ClipsListItem';
import SecondaryButton from '../common/SecondaryButton';

type Props = {
  clip: TwitchClip;
  settings: UserSettings;
  cropTemplates?: CropTemplate[];
  handleUpdate: (id: string) => void;
};

const ApprovedClipItem = ({ clip, settings, cropTemplates, handleUpdate }: Props) => {
  const [showPreview, setShowPreview] = useState(false);
  const includesYouTube = settings.selectedPlatforms?.includes('youtube');
  const includesTiktok = settings.selectedPlatforms?.includes('tiktok');
  const includesInstagram = settings.selectedPlatforms?.includes('instagram');
  const includesFacebook = settings.selectedPlatforms?.includes('instagram');

  const cropSettings = settings.cropType
    ? cropTemplates?.filter((temp) => temp.cropType === settings.cropType)
    : undefined;

  const screenCrop = cropSettings?.[0]?.screenCrop as CropSettings | undefined;

  return (
    <>
      <div className="grid items-center justify-between gap-2 rounded-sm border-b px-2 py-2 hover:bg-grey-100 md:grid-cols-6">
        <div className={`col-span-3 flex items-center gap-2`}>
          <div>
            <h3
              onClick={() => setShowPreview(!showPreview)}
              className="text-base text-violet hover:cursor-pointer md:text-xl"
            >
              {trimEllip(clip.youtubeTitle || clip.title)}
            </h3>
            <a
              href={`https://clips.twitch.tv/${clip.twitch_id}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-gray-400"
            >
              {trimEllip(clip.twitch_id)}
            </a>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 md:col-span-2 md:gap-3">
          <FaYoutube className={`h-10 w-10 text-red-500 ${!includesYouTube && 'grayscale'}`} />
          <FaTiktok className={`h-7 w-7 text-black ${!includesTiktok && 'opacity-30'}`} />
          <FiInstagram className={`h-8 w-8 text-pink-400 ${!includesInstagram && 'grayscale'}`} />
          <FaFacebookSquare
            className={`h-8 w-8 text-sky-500 ${!includesFacebook && 'grayscale'}`}
          />
        </div>

        <div className="col-span-4 row-start-3 flex flex-col items-center md:col-start-6 md:row-start-1">
          <SecondaryButton
            onClick={() => handleUpdate(clip.twitch_id)}
            className="px-2 py-1 text-xs"
          >
            Unapprove
          </SecondaryButton>
        </div>
      </div>

      {settings.cropType && cropSettings && (
        <PreviewModal
          modalOpen={showPreview}
          closeModal={setShowPreview}
          clipUrl={clip.download_url}
          cropData={{
            cropType: settings.cropType,
            camCrop: (cropSettings[0]?.camCrop as CropSettings | null) || undefined,
            screenCrop: screenCrop!
          }}
          clipTitle={clip.title}
        />
      )}
    </>
  );
};

export default ApprovedClipItem;
