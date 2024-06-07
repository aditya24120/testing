import { createElement, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import UserLayout from '../../components/UserLayout';
import PlatformSelectionScreen from '../../components/upload/PlatformSelectionScreen';
import { states } from '../../utils/states';
import NoStateFound from '../../components/upload/NoStateFound';
import { useUploadContext } from '../../context/UploadContext';
import { initAmplitude, logEvent } from '../../utils/amplitude';
import { toast } from 'react-toastify';
import LoginScreen from '../../components/upload/LoginScreen';
import DetailsScreen from '../../components/upload/DetailsScreen';
import ReviewScreen from '../../components/upload/ReviewScreen';
import UploadButton from '../../components/upload/UploadButton';
import Stepper from '../../components/upload/Stepper';
import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { ClipContext, UserContextState } from '../../context/ClipContext';
import ScheduleClip from '../../components/upload/ScheduleClip';
import { trpc } from '../../utils/trpc';
import { useQueryClient } from 'react-query';
import { TLocalStorageYouTubeToken } from '../../types/types';

const Upload: NextPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/');
    }
  });
  const { scheduleClip, setScheduleClip } = useContext(ClipContext) as UserContextState;
  const fullContext = useUploadContext();
  const { currentState, prevState, setUsernames, usernames } = fullContext;

  const { mutateAsync: upsertAccount, error: accountError } = trpc.useMutation(
    ['setting.createOrUpdate'],
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['setting.getAccounts']);
      }
    }
  );

  const { mutateAsync: updateUsername } = trpc.useMutation(['setting.setUsername']);

  const defaultSteps = [
    { id: '1', name: 'Select Platforms', href: '#', status: 'current', stateName: states.SELECT },
    { id: '2', name: 'Connect Platforms', href: '#', status: 'upcoming', stateName: states.LOGIN },
    { id: '3', name: 'Add Details', href: '#', status: 'upcoming', stateName: states.DETAILS },
    { id: '4', name: 'Review & Upload', href: '#', status: 'upcoming', stateName: states.REVIEW },
    {
      id: '5',
      name: scheduleClip ? 'Schedule Clip' : 'Upload Complete!',
      href: '#',
      status: 'upcoming',
      stateName: states.FINISH
    }
  ];

  const stateToComp = {
    [states.SELECT]: PlatformSelectionScreen,
    [states.LOGIN]: LoginScreen,
    [states.DETAILS]: DetailsScreen,
    [states.REVIEW]: ReviewScreen,
    [states.FINISH]: scheduleClip ? ScheduleClip : UploadButton
  };

  const setUsernameInDb = async (
    provider: 'youtube' | 'tiktok' | 'instagram',
    username: string
  ) => {
    await updateUsername({ provider, username });
  };

  useEffect(() => {
    if (!localStorage.getItem('savedFileKey')) {
      router.push('/clips/');
      toast.error('Please select a clip to upload');
    }
    if (localStorage.getItem('scheduleClip') === 'true') {
      setScheduleClip(true);
      stateToComp[states.FINISH] = ScheduleClip;
    }
  }, [router]);

  const [didInit, setDidInit] = useState(false);

  useEffect(() => {
    if (!didInit) {
      initAmplitude();
      setDidInit(true);
    }
    if (currentState && prevState && session) {
      logEvent('stateChange', fullContext, session);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentState, prevState]);

  useEffect(() => {
    console.log('Checking for query params');
    const { youtubeToken, code, scopes } = router.query;
    const igToken = router.query?.['api-key'];
    if (code) {
      if (scopes?.includes('user.info.basic')) {
        //tiktok
        axios.get('/api/tiktokRedirect?code=' + code).then((res) => {
          let newToken = res.data.tiktokSessionId;
          if (newToken.error_code != 0) {
            toast.error(
              'TikTok login failed\nIf you just reloaded the page, you can ignore this. Otherwise, try again or contact rox@rox.works'
            );
            if (session) logEvent('tiktok_login_failed', fullContext, session);
            return;
          }
          const TTpromise = new Promise((resolve, reject) => {
            const update = upsertAccount({
              type: 'oauth',
              provider: 'tiktok',
              providerAccountId: newToken.open_id,
              refresh_token: newToken.refresh_token ?? null,
              refresh_expires_at: newToken.refresh_expires_in,
              access_token: newToken.access_token ?? null,
              expires_at: newToken.expires_in ?? null,
              token_type: 'Bearer',
              scope: newToken.scope
            });
            if (accountError) {
              reject('tiktok account update failed');
              return;
            }
            resolve(update);
          });
          TTpromise.then(() => {
            axios
              .get('/api/tiktok/username?tiktokToken=' + JSON.stringify(newToken))
              .then((usernameBlob) => {
                let newUsername = usernameBlob.data.username;
                setUsernameInDb('tiktok', newUsername);
                if (newUsername) setUsernames({ ...usernames, tiktok: newUsername });
              });
            toast.success('Tiktok login successful!');
            router.replace('/clips/upload', undefined, { shallow: true });

            if (session) logEvent('tiktok_login_success', fullContext, session);
          }).catch(() => {
            console.log('tiktok account update failed');
          });
        });
      } else {
        //@ts-ignore
        axios.get('/api/youtubeInitialAuth?code=' + code).then((res) => {
          let newToken: TLocalStorageYouTubeToken = res.data.token.token;
          if (newToken == undefined) {
            toast.error('Youtube login failed');
            if (session) logEvent('yt_login_failed', fullContext, session);
            return;
          }

          upsertAccount({
            type: 'oauth',
            provider: 'youtube',
            providerAccountId: newToken.access_token,
            refresh_token: newToken.refresh_token ?? undefined,
            access_token: newToken.access_token ?? undefined,
            expires_at: parseInt(String(newToken.expiry_date / 1000)),
            token_type: 'Bearer',
            scope: newToken.scope
          });
          setUsernames({ ...usernames, youtube: 'Connected' });
          toast.success('YouTube login successful!');
          router.replace('/clips/upload', undefined, { shallow: true });
          if (session) logEvent('yt_login_success', fullContext, session);
        });
      }
    }
    if (youtubeToken && typeof youtubeToken === 'string') {
      toast.success('YouTube login successful!');
    }

    if (igToken) {
      toast.success('Instagram login successful!');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return (
    <UserLayout>
      <Stepper defaultSteps={defaultSteps} />

      {createElement(stateToComp[currentState] || NoStateFound)}
    </UserLayout>
  );
};
export default Upload;
