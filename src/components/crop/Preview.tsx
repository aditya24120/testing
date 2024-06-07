import { useState } from 'react';
import Link from 'next/link';
import { BsDownload, BsUpload } from 'react-icons/bs';
import { FiSettings } from 'react-icons/fi';
import { AiOutlineSchedule } from 'react-icons/ai';
import { useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { waitForVideoCrop } from '../../utils/cropEdit';
import { editVideoForIG } from '../../utils/facebook';
import { toast } from 'react-toastify';
import { TCropData, Clip, TCropType } from '../../types/types';
import { ClipContext, UserContextState } from '../../context/ClipContext';
import { useSession } from 'next-auth/react';
import { useUploadContext } from '../../context/UploadContext';
import { states } from '../../utils/states';
import VideoPreview from './VideoPreview';
import { trpc } from '../../utils/trpc';
import UpdateAccountModal from '../UpdateAccountModal';
import Upgrade from '../Upgrade';
import { sleep } from '../../utils';
import SecondaryButton from '../common/SecondaryButton';

type ClipData = {
  cropType: TCropType;
  startTime: number;
  endTime: number;
  camCrop?: any;
  screenCrop: any;
};

type Prop = {
  clip: Clip;
  clipData: ClipData;
  setStateAndPrevState: (s: string) => void;
};

const Preview: React.FC<Prop> = ({ clip, clipData, setStateAndPrevState }) => {
  const { data: session } = useSession();
  const user = session?.user;
  const { setCropData, setScheduleClip, currentClip } = useContext(ClipContext) as UserContextState;
  const { setCurrentState } = useUploadContext();
  const shouldRender = useRef(true);
  const [clipRendered, setClipRendered] = useState(false);
  const [upgradeShow, setUpgradeShow] = useState(false);

  const { data: userDetails, isLoading: getUserLoading } = trpc.useQuery(['user.getDetails']);
  const isSubbed = user?.userId === userDetails?.id && userDetails?.sub_status === 'active';

  const { mutateAsync: getSRT, isError: isTranscribeError } = trpc.useMutation('transcribe.getSRT');

  const [transcribeJobId, setTranscribeJobId] = useState<string>();
  const { mutateAsync: checkStatus, isError: isCheckStatusError } = trpc.useMutation([
    'transcribe.checkStatus'
  ]);
  const { mutateAsync: cancelJob } = trpc.useMutation(['transcribe.cancelJob']);
  const { mutateAsync: saveTranscription } = trpc.useMutation(['transcribe.save']);

  const checkTranscribeStatus = async () => {
    if (!clip) return;
    let response = await getSRT({
      video_url: clip.download_url,
      twitch_id: clip.twitch_id
    });
    if (response.alreadyExists || !response.data) return;

    let transcribe = response.data;
    setTranscribeJobId(transcribe.id);
    if (isTranscribeError) return;

    while (transcribe?.status !== 'succeeded' && transcribe?.status !== 'failed') {
      await sleep(1500);
      const response = await checkStatus({ jobId: transcribe.id });
      transcribe = response;
      if (isCheckStatusError) return;
    }
    if (
      !transcribe.output ||
      !transcribe.completed_at ||
      !transcribe.created_at ||
      !transcribe.started_at
    )
      return;
    if (transcribe.status === 'succeeded') {
      await saveTranscription({
        completedAt: transcribe.completed_at,
        createdAt: transcribe.created_at,
        startedAt: transcribe.started_at,
        status: transcribe.status,
        jobId: transcribe.id,
        format: transcribe.input.format,
        audioPath: transcribe.input.audio_path,
        textOutput: transcribe.output?.text,
        subtitles: transcribe.output?.subtitles,
        language: transcribe.output?.language,
        version: transcribe.version,
        twitchId: clip.twitch_id
      });
    }
  };

  const cancelTranscription = () => {
    if (!transcribeJobId) return;
    cancelJob({ jobId: transcribeJobId });
  };

  useEffect(() => {
    const exportClip = async () => {
      if (currentClip?.autoCaption) {
        await checkTranscribeStatus();
      }

      const url = process.env.NEXT_PUBLIC_CROP_VIDEO_URL || 'http://localhost:5000';
      const cropApp = process.env.NEXT_PUBLIC_CROP_APP_KEY;
      const cropData: TCropData = {
        cropType: clipData.cropType!,
        startTime: clipData.startTime,
        endTime: clipData.endTime,
        camCrop: clipData.camCrop,
        screenCrop: clipData.screenCrop
      };
      setCropData(cropData);
      const res = await axios.post(
        url + '/crop',
        {
          clip: currentClip || clip,
          cropData
        },
        {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer: ${cropApp}` }
        }
      );

      localStorage.setItem('cropJobId', res.data.id);
      localStorage.setItem('savedFileKey', 'pending');
      const videoLink = await waitForVideoCrop(res.data.id);

      localStorage.setItem('savedFileKey', videoLink);
      editVideoForIG('https://file.io/' + videoLink).then((jobId) => {
        localStorage.setItem('jobId', jobId);
      });

      if (res.status !== 200) {
        toast.error('Something went wrong');
        return;
      }
      setClipRendered(true);
    };
    if (shouldRender.current) {
      shouldRender.current = false;
      exportClip();
    }
    return () => cancelTranscription();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip]);

  if (getUserLoading) {
    return null;
  }

  return (
    <>
      <UpdateAccountModal modalOpen={upgradeShow} setModalOpen={setUpgradeShow} />
      <section id="preview-clip">
        <div className="container mx-auto flex flex-col-reverse p-6 lg:mb-0 lg:flex-row">
          <div className="flex flex-col space-y-10 lg:mt-16 lg:w-1/2">
            <h1 className="justify center text-center text-2xl font-semibold text-violet lg:text-2xl">
              Upload now or schedule for later
            </h1>
            <div className="m-auto flex w-2/3 flex-col gap-6">
              <Link href="/clips/upload" passHref>
                <button
                  onClick={() => {
                    setCurrentState(states.SELECT);
                    setScheduleClip(false);
                    localStorage.setItem('scheduleClip', 'false');
                  }}
                  className="flex items-center justify-center gap-4 rounded-b-lg rounded-tl-lg bg-violet px-6 py-2 font-bold text-white hover:enabled:bg-violet-600"
                >
                  <BsUpload className="h-7 w-7" />
                  <span>Upload Now</span>
                </button>
              </Link>

              <Link href="/clips/upload" passHref>
                <button
                  disabled={!user}
                  onClick={(e) => {
                    if (!isSubbed) {
                      e.preventDefault();
                      setUpgradeShow(true);
                    } else {
                      setCurrentState(states.SELECT);
                      setScheduleClip(true);
                      localStorage.setItem('scheduleClip', 'true');
                    }
                  }}
                  className="flex items-center justify-center gap-4 rounded-b-lg rounded-tl-lg bg-rose-600 px-6 py-2 font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed"
                >
                  <AiOutlineSchedule className="h-8 w-8" />
                  <span>Schedule Upload</span>
                </button>
              </Link>

              {clipRendered ? (
                <a
                  href={`https://file.io/${localStorage.getItem('savedFileKey')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-4 rounded-b-lg rounded-tl-lg bg-purple-700 px-6 py-2 font-bold text-white hover:bg-purple-700/80"
                >
                  <BsDownload className="h-8 w-8" />
                  <span>Download</span>
                </a>
              ) : (
                <button
                  disabled
                  className="flex cursor-not-allowed items-center justify-center gap-4 rounded-b-lg rounded-tl-lg bg-purple-700 px-6 py-2 font-bold text-white hover:bg-purple-700/80"
                >
                  <BsDownload className="h-8 w-8 animate-pulse" />
                  <span className="animate-pulse">Clip Rendering...</span>
                </button>
              )}

              <SecondaryButton
                onClick={() => {
                  setStateAndPrevState('screenCrop');
                }}
                className="flex items-center justify-center gap-4 py-2"
              >
                <FiSettings className="h-8 w-8" />
                <span>Change crop settings</span>
              </SecondaryButton>

              {!isSubbed && <Upgrade />}
            </div>
          </div>

          <div>
            <VideoPreview clipURL={clip.download_url} clipData={clipData} />
          </div>
        </div>
      </section>
    </>
  );
};
export default Preview;
