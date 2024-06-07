import { Dispatch, SetStateAction } from 'react';
import { Clip } from '../../types/types';
import VideoPlayer from '../VideoPlayer';

const internalWidth = 960;
const internalHeight = 540;

type Props = {
  clip: Clip;
  state: string;
  setDefaultStartTime?: Dispatch<SetStateAction<number>>;
  setDefaultEndTime?: Dispatch<SetStateAction<number>>;
};
const TrimVideo = ({ clip, state, setDefaultStartTime, setDefaultEndTime }: Props) => {
  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <header className="mb-12">
          <h2 className="text-2xl font-semibold text-violet" style={{ width: internalWidth }}>
            Trim clip to desired length
          </h2>
          <p className="text-gray-400">Clips must be greater than 3 seconds.</p>
        </header>
        <VideoPlayer
          url={clip.download_url}
          width={internalWidth}
          height={internalHeight}
          autoplay={true}
          state={state}
          muted={true}
          setDefaultStartTime={setDefaultStartTime}
          setDefaultEndTime={setDefaultEndTime}
        />
      </div>
    </>
  );
};
export default TrimVideo;
