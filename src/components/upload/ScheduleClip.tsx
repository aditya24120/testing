import { useContext, useState } from 'react';
import Datepicker from '../common/Datepicker';
import { AiOutlineCalendar, AiOutlineFieldTime, AiOutlineSchedule } from 'react-icons/ai';
import TimeAgo from 'react-timeago';
import { logEvent } from '../../utils/amplitude';

import { toast } from 'react-toastify';
import { useUploadContext } from '../../context/UploadContext';
import { ClipContext, UserContextState } from '../../context/ClipContext';
import { useRouter } from 'next/router';
import { states } from '../../utils/states';
import { useSession } from 'next-auth/react';
import { trpc } from '../../utils/trpc';
import InfoAlert from '../alert/InfoAlert';
import SecondaryButton from '../common/SecondaryButton';
import PrimaryButton from '../common/PrimaryButton';

function roundToNearest15(date = new Date()) {
  const minutes = 15;
  const ms = 1000 * 60 * minutes;

  return new Date(Math.ceil(date.getTime() / ms) * ms);
}

const ScheduleClip = () => {
  const locale = navigator?.language;
  const router = useRouter();
  const { data: session } = useSession();
  const { youtubeFields, setYoutubeFields, platforms, setCurrentState, setPrevState } =
    useUploadContext();
  const { currentClip, cropData, setCurrentClip, setCropData } = useContext(
    ClipContext
  ) as UserContextState;
  const [scheduleDate, setScheduleDate] = useState(roundToNearest15());
  const [scheduled, setScheduled] = useState(false);

  const {
    mutateAsync: createSchedule,
    error: scheduleError,
    isLoading
  } = trpc.useMutation('uploadClip.createClip');

  const clearState = () => {
    localStorage.removeItem('savedFileKey');
    localStorage.removeItem('jobId');
    setYoutubeFields({
      ...youtubeFields,
      caption: '',
      title: ''
    });
    setCurrentClip(undefined);
    setCropData(undefined);
  };

  const filterPassedTime = (time: Date) => {
    const currentDate = new Date();
    const selectedDate = new Date(time);

    return currentDate.getTime() < selectedDate.getTime();
  };

  const scheduleClip = async () => {
    const uploadData = {
      currentClip: currentClip!,
      uploadPlatforms: platforms,
      fields: {
        caption: youtubeFields?.caption,
        title: youtubeFields?.title!,
        privacy: youtubeFields?.privacy,
        description: youtubeFields?.description,
        category: youtubeFields?.category || 'Gaming',
        facebookDescription: youtubeFields?.facebookDescription
      },
      cropData: cropData!,
      uploaded: false,
      status: 'SCHEDULED',
      scheduledUploadTime: new Date(scheduleDate).toUTCString(),
      tiktokUploadComplete: false,
      youtubeUploadComplete: false,
      igUploadComplete: false,
      facebookUploadComplete: false
    };
    if (!cropData || !currentClip) {
      logEvent('create_schedule_clip_missing_data', uploadData, session!);
    } else {
      await createSchedule(uploadData);
      if (scheduleError) {
        toast.error('Something went wrong! Unable to schedule clip.');
        console.log(scheduleError);
        return;
      }
    }
    clearState();
    setScheduled(true);
    toast.success('Clip has been scheduled successfully');
    if (session) {
      logEvent(
        'upload_scheduled_successful',
        {
          scheduleDate,
          ...youtubeFields,
          platforms
        },
        session
      );
    }

    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="mb-6 text-center text-2xl font-bold text-violet">
        Schedule a date and time to upload
      </h1>

      {scheduled && (
        <div
          className="mb-4 flex items-center rounded-lg bg-violet-400 p-4 text-sm font-medium text-white"
          role="alert"
        >
          <AiOutlineSchedule className="mr-3 inline h-5 w-5 flex-shrink-0" />

          <span>
            Clip scheduled to upload <TimeAgo date={scheduleDate} />
          </span>
        </div>
      )}

      <div className="flex flex-col gap-8 text-violet">
        <div>
          <label className="text-lg font-semibold">Date</label>
          <div className="m-auto flex items-center justify-center gap-2">
            <AiOutlineCalendar className="h-8 w-8 " />

            <Datepicker
              selected={scheduleDate}
              onChange={(date) => {
                if (date) {
                  setScheduleDate(date);
                }
              }}
              minDate={roundToNearest15()}
              dateFormat="PP"
              locale={locale}
              disabled={scheduled}
            />
          </div>
        </div>

        <div>
          <label className="text-lg font-semibold">Time</label>
          <div className="m-auto flex items-center justify-center gap-2">
            <AiOutlineFieldTime className="h-8 w-8 " />

            <Datepicker
              selected={roundToNearest15(scheduleDate)}
              onChange={(date) => {
                if (date) {
                  setScheduleDate(date);
                }
              }}
              showTimeSelect
              showTimeSelectOnly
              timeFormat="p"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm aa"
              filterTime={filterPassedTime}
              locale={locale}
              disabled={scheduled}
            />
          </div>
        </div>
      </div>

      <div className="mb-3 mt-10 flex justify-center gap-5">
        <SecondaryButton
          onClick={async (e) => {
            e.preventDefault();
            clearState();
            await router.push('/clips/');
            setCurrentState(states.SELECT);
            setPrevState(states.SELECT);
          }}
        >
          {scheduled ? 'Upload Again' : 'Cancel'}
        </SecondaryButton>

        <PrimaryButton disabled={scheduled} onClick={scheduleClip}>
          {isLoading ? 'Scheduling...' : 'Schedule'}
        </PrimaryButton>
      </div>
    </div>
  );
};
export default ScheduleClip;
