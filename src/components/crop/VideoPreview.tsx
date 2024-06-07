import { useRef, useState, useEffect } from 'react';
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa';
import { CropSettings, TCropType, VideoContainer } from '../../types/types';
import MultiRangeVideoSlider from '../MultiRangeVideoSlider';
export type ClipData = {
  cropType: TCropType;
  startTime?: number;
  endTime?: number;
  camCrop?: CropSettings;
  screenCrop: CropSettings;
};

type Prop = {
  clipURL: string;
  clipData: ClipData;
  muted?: boolean;
  showTrimBar?: boolean;
  startTime?: number;
  endTime?: number;
  updateStartTime?: (value: number) => void;
  updateEndTime?: (value: number) => void;
};

const VideoPreview = ({
  clipURL,
  clipData,
  muted = true,
  showTrimBar = false,
  startTime = 0,
  endTime,
  updateStartTime,
  updateEndTime
}: Prop) => {
  const camVid = useRef() as React.MutableRefObject<HTMLVideoElement>;
  const vidContainer = useRef() as React.MutableRefObject<HTMLDivElement>;
  const screenVid = useRef() as React.MutableRefObject<HTMLVideoElement>;
  const vidContainer2 = useRef() as React.MutableRefObject<HTMLDivElement>;

  const [camVideo, setCamVideo] = useState<VideoContainer>({});
  const [videoContainer, setVideoContainer] = useState<VideoContainer>({});
  const [screenVideo, setScreenVideo] = useState<VideoContainer>({});
  const [videoContainer2, setVideoContainer2] = useState<VideoContainer>({});

  const [canPlay, setCanPlay] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState(muted);


  const vidStartTime = startTime !== 0 ? startTime : clipData.startTime || 0;
  const vidEndTime = endTime ? endTime : clipData.endTime;

  const seekTo = (time: number) => {
    screenVid.current.currentTime = time;
    if (camVid.current) {
      camVid.current.currentTime = time;
    }
  };
  const handleRangeEndChange = (end: number) => {
    if (!updateEndTime) return;
    updateEndTime(end);

    seekTo(end);
  };
  const handleRangeStartChange = (start: number) => {
    if (!updateStartTime) return;
    updateStartTime(start);

    seekTo(start);
  };

  const onCanPlay = () => {
    setCanPlay(true);
    if (!canPlay && !endTime && updateEndTime) {
      updateEndTime(screenVid?.current?.duration);
    }
  };

  const onPlay = () => {
    if (!screenVid.current) return;
    if (
      (vidEndTime && screenVid.current.currentTime >= vidEndTime) ||
      screenVid.current.currentTime < vidStartTime
    ) {
      if (typeof camVid.current?.currentTime === 'number') {
        camVid.current.currentTime = vidStartTime;
      }
      screenVid.current.currentTime = vidStartTime;
      screenVid.current.play();
    }
  };

  const cropDisplay = (clipdata: ClipData, partOfScreen: string) => {
    // const DISPLAY_WIDTH = 345;
    const DISPLAY_HEIGHT = 613;
    let desiredWidth = 345;
    let desiredHeight = 613;

    let cropToUse = partOfScreen === 'cam' ? clipdata?.camCrop : clipdata?.screenCrop;

    if (cropToUse) {
      let aspectRatio = (cropToUse.width / cropToUse.height) * (16 / 9);
      let fullWidth = desiredWidth / cropToUse.width;
      desiredHeight = desiredWidth / aspectRatio;
      let fullHeight = desiredHeight / cropToUse.height;

      if (partOfScreen === 'cam') {
        setCamVideo({
          width: fullWidth,
          height: fullHeight,
          marginLeft: -1 * cropToUse.x * fullWidth,
          marginTop: -1 * cropToUse.y * fullHeight
        });

        const videoContainerWidth = desiredWidth;
        const videoContainerHeight = desiredHeight;
        const videoContainerMarginBottom = videoContainerHeight;

        setVideoContainer({
          width: videoContainerWidth,
          height: videoContainerHeight,
          marginBottom: videoContainerMarginBottom
        });
      }

      if (partOfScreen === 'screen') {
        if (clipData.cropType === 'CAM_FREEFORM') {
          // fullWidth = desiredWidth * cropToUse.width;
          if (aspectRatio > 1) {
            // SHB = 1920 - SHA;
            // fullWidth = desiredWidth;
            // fullHeight = desiredWidth * aspectRatio;
          } else {
            // SWB = 1080;
            let camDisplayHeight =
              desiredWidth * (clipData.camCrop?.width! / clipData.camCrop?.height!) * (9 / 16);

            let screenDisplayHeight = DISPLAY_HEIGHT - camDisplayHeight;
            desiredHeight = screenDisplayHeight;
            let screenDisplayWidth = screenDisplayHeight * aspectRatio;
            desiredWidth = screenDisplayWidth;
            fullWidth = screenDisplayWidth / cropToUse.width;
            fullHeight = screenDisplayHeight / cropToUse.height;
          }
        }
        setScreenVideo({
          width: fullWidth,
          height: fullHeight / aspectRatio,
          marginLeft: -1 * cropToUse.x * fullWidth,
          marginTop: -1 * cropToUse.y * fullHeight
        });
        const videoContainer2Width = desiredWidth;
        const videoContainer2Height = desiredHeight;
        const videoContainer2MarginBottom = videoContainer2Height;

        setVideoContainer2({
          width: videoContainer2Width,
          height: videoContainer2Height,
          marginBottom: videoContainer2MarginBottom
        });
      }
    } else {
      console.log('no crop data');
      console.log(clipdata);
    }
  };

  const updateTime = () => {
    if (screenVid.current?.currentTime) {
      if (
        (vidEndTime && screenVid.current.currentTime >= vidEndTime) ||
        screenVid.current.currentTime < vidStartTime
      ) {
        if (camVid.current?.currentTime) {
          camVid.current.currentTime = vidStartTime;
        }
        screenVid.current.currentTime = vidStartTime;
      }
    }
  };

  useEffect(() => {
    if (!screenVid.current) return;
    if (camVid.current && !muted) {
      camVid.current.volume = 0;
    }
    if (!muted) {
      screenVid.current.volume = 0.2;
    }

    screenVid.current.removeEventListener('timeupdate', updateTime);

    screenVid.current.addEventListener('timeupdate', updateTime);

    return () => {
      window.removeEventListener('timeupdate', updateTime);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenVid.current]);

  useEffect(() => {
    cropDisplay(clipData, 'cam');
    cropDisplay(clipData, 'screen');
  }, [clipData, vidStartTime, endTime]);

  return (
    <>
      <div className="flex justify-center">
        <div className=" flex scale-90  flex-col  gap-2 rounded-3xl bg-black px-3 py-4 ">
          <span className="m-auto mb-1 block h-1 w-9  rounded-full bg-gray-600"></span>
          <div
            className={`mx-auto flex min-h-[613px] ${clipData.camCrop && 'flex-col'
              }  items-center overflow-hidden rounded-t-lg `}
          >
            {clipData.camCrop && (
              <div
                ref={vidContainer}
                id="vidContainer"
                className=" overflow-hidden "
                style={{
                  width: `${videoContainer.width}px`,
                  height: `${videoContainer.height}px`,
                  marginBottom: `${videoContainer.marginBottom}`
                }}
              >
                <video
                  ref={camVid}
                  id="currentclip"
                  src={`${clipURL}`}
                  loop
                  muted
                  autoPlay
                  className={`max-w-none`}
                  style={{
                    width: `${camVideo.width}px`,
                    height: `${camVideo.height}px`,
                    marginLeft: `${camVideo.marginLeft}px`,
                    marginTop: `${camVideo.marginTop}px`
                  }}
                />
              </div>
            )}
            <div
              ref={vidContainer2}
              id="vidContainer2"
              className="overflow-hidden rounded-b-lg"
              style={{
                width: `${videoContainer2.width}px`,
                height: `${videoContainer2.height}px`,
                marginBottom: `${videoContainer2.marginBottom}`
              }}
            >
              <video
                ref={screenVid}
                id="screenclip"
                src={`${clipURL}`}
                onCanPlay={onCanPlay}
                onTimeUpdate={updateTime}
                onPlay={onPlay}
                loop
                muted={isMuted}
                autoPlay
                className={` max-w-none`}
                style={{
                  width: `${screenVideo.width}px`,
                  // height: `${screenVideo.height}px`,
                  marginLeft: `${screenVideo.marginLeft}px`,
                  marginTop: `${screenVideo.marginTop}px`
                }}
              />
            </div>
          </div>
          <div className="relative">
            <span className="m-auto mt-2 block h-8 w-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-500"></span>

            <div className=" absolute bottom-0 right-2  ">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="inline-block rounded-b-lg rounded-tl-lg bg-border py-1.5 px-3 font-bold text-black hover:bg-border/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isMuted ? (
                  <FaVolumeMute className="h-5 w-5" />
                ) : (
                  <FaVolumeUp className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showTrimBar && canPlay && (
        <div className="mb-16  w-full">
          <MultiRangeVideoSlider
            min={0}
            max={screenVid?.current?.duration}
            loaded={true}
            onEndChange={(max) => handleRangeEndChange(max)}
            onStartChange={(min) => handleRangeStartChange(min)}
          />
        </div>
      )}
    </>
  );
};

export default VideoPreview;
