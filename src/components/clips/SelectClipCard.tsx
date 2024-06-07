import TimeAgo from 'react-timeago';
import { Clip } from '../../types/types';
import Image from 'next/image';

const SelectClipCard = ({
  clip,
  setSelectedClip
}: {
  clip: Clip;
  setSelectedClip: (clip: Clip) => void;
}) => {
  return (
    <div
      onClick={() => setSelectedClip(clip)}
      className="flex h-full justify-center opacity-90 hover:cursor-pointer hover:opacity-100 md:w-[49%] "
    >
      <div className="w-full rounded-lg shadow-lg ">
        <div className="relative aspect-square h-64 w-full">
          <Image
            className="rounded-t-lg"
            src={clip.thumbnail_url}
            alt=""
            width={480}
            height={272}
            layout="fill"
            objectFit="cover"
          />
        </div>

        <div className="p-4">
          <TimeAgo date={clip.created_at} className="text-xs text-gray-400" />

          <h5 className="mb-2 max-w-full overflow-hidden text-ellipsis whitespace-nowrap font-medium text-violet">
            {clip.title}
          </h5>
        </div>
      </div>
    </div>
  );
};
export default SelectClipCard;
