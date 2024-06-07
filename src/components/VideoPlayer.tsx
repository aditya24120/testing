import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import MultiRangeVideoSlider from './MultiRangeVideoSlider';

const VideoPlayer = ({
  url,
  width = 960,
  height = 540,
  autoplay = false,
  loop = false,
  muted = false,
  state,
  defaultStartTime = 0,
  defaultEndTime = 60,
  setDefaultStartTime,
  setDefaultEndTime,
}: {
  url: string;
  width: number;
  height: number;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  state?: string;
  defaultStartTime?: number;
  defaultEndTime?: number;
  setDefaultStartTime?: Dispatch<SetStateAction<number>>;
  setDefaultEndTime?: Dispatch<SetStateAction<number>>;
}) => {
  const videoRef = useRef() as React.MutableRefObject<HTMLVideoElement>;
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(60);

  const [video, setVideo] = useState({
    pip: false,
    playing: false,
    controls: true,
    volume: 0.8,
    muted: true,
    played: 0,
    loaded: false,
    duration: 0,
    playbackRate: 1.0,
    loop: false,
  });

  const seekTo = (time: number) => {
    videoRef.current.currentTime = time;
  };
  const handleRangeEndChange = (end: number) => {
    setEndTime(end);
    if (setDefaultEndTime) {
      setDefaultEndTime(end);
    }
    seekTo(end);
  };
  const handleRangeStartChange = (start: number) => {
    setStartTime(start);
    if (setDefaultStartTime) {
      setDefaultStartTime(start);
    }
    seekTo(start);
  };

  const pauseVideo = () => {
    videoRef.current.pause();
    setVideo({ ...video, playing: false });
  };

  const updateTime = () => {
    if (videoRef.current?.currentTime) {
      if (!autoplay) {
        if (videoRef.current.currentTime >= endTime) pauseVideo();
      } else {
        if (videoRef.current.currentTime >= endTime || videoRef.current.currentTime < startTime) {
          videoRef.current.currentTime = startTime;
        }
      }
    }
  };

  const onCanPlay = () => {
    setVideo({ ...video, loaded: true, duration: videoRef.current.duration });
  };

  const onPlay = () => {
    if (videoRef.current.currentTime >= endTime || videoRef.current.currentTime < startTime) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
    }
  };

  useEffect(() => {
    if (!video.loaded) return;
    const startTime =
      defaultStartTime && (state === 'camCrop' || state === 'screenCrop')
        ? +parseFloat(String(defaultStartTime)).toFixed(2)
        : 0;
    setStartTime(startTime);
    if (setDefaultStartTime) {
      setDefaultStartTime(startTime);
    }
    const endTime: number =
      defaultEndTime && (state === 'camCrop' || state === 'screenCrop')
        ? +parseFloat(String(defaultEndTime)).toFixed(2)
        : +parseFloat(String(videoRef.current.duration)).toFixed(2);
    setEndTime(endTime);
    if (setDefaultEndTime) {
      setDefaultEndTime(endTime);
    }
    // videoRef.current.currentTime = startTime;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video.loaded]);

  return (
    <>
      <div className="video-container">
        <video
          className="cursor aspect-video"
          ref={videoRef}
          src={url}
          width={width}
          height={height}
          controls
          autoPlay={autoplay}
          onCanPlay={onCanPlay}
          onTimeUpdate={updateTime}
          onPlay={onPlay}
          loop={loop}
          muted={muted}
        ></video>

        {video.loaded && (
          <div className="mb-16 mt-4 w-full">
            <MultiRangeVideoSlider
              min={0}
              max={videoRef?.current?.duration}
              loaded={video.loaded}
              onEndChange={(max) => handleRangeEndChange(max)}
              onStartChange={(min) => handleRangeStartChange(min)}
            />
          </div>
        )}
      </div>
      {/* 
      <div>
        <div>startTime: {startTime}</div>
        <div>endTime: {endTime}</div>
        <div>loaded: {video.loaded === true ? 'true' : 'false'}</div>
      </div> */}
    </>
  );
};
export default VideoPlayer;
