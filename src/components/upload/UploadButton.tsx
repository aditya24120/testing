import NextButtons from '../NextButtons';
import { AccountProviders, useUploadContext } from '../../context/UploadContext';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  youtubeUpload,
  tiktokUpload,
  IGUpload,
  refreshYoutubeToken,
  refreshTikTokToken
} from '../../utils/uploads';
import ProgressBar from '@ramonak/react-progress-bar';
import { states } from '../../utils/states';
var FakeProgress = require('fake-progress');
import { logEvent, initAmplitude } from '../../utils/amplitude';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { waitForVideoCrop } from '../../utils/cropEdit';
import { ClipContext, UserContextState } from '../../context/ClipContext';
import { trpc } from '../../utils/trpc';
import { QueryClient, useQueryClient } from 'react-query';
import { useSession } from 'next-auth/react';
import { Account, ToSend } from '../../types/types';
import ErrorAlert from '../alert/ErrorAlert';
import SecondaryButton from '../common/SecondaryButton';
import Show from '../common/Show';

type SocialResponse = {
  Instagram?: {};
  Youtube?: any;
  TikTok?: {};
  Facebook?: {};
};

type YouTubeErrorType = 'refreshToken' | 'uploadError';

const YoutubeStatusError = {
  ['refreshToken']: 'FAILED_REFRESH_TOKEN',
  ['uploadError']: 'FAILED_MANUAL_UPLOAD'
};

const UploadButton = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const { currentClip, cropData } = useContext(ClipContext) as UserContextState;
  const {
    uploadCounter,
    setUploadCounter,
    youtubeFields,
    setYoutubeFields,
    setPrevState,
    setCurrentState,
    platforms
  } = useUploadContext();

  const [providers, setProviders] = useState<AccountProviders[]>([]);

  const { data: accounts, isLoading } = trpc.useQuery(['setting.getAccounts'], {
    onSuccess: (data) => {
      setProviders(data.map((acc) => acc.provider) as AccountProviders[]);
    },

    onError: (error) => {
      console.log('error me: ', error.data?.code);
      if (error.data?.code === 'UNAUTHORIZED') {
        router.push('/');
      }
    }
  });

  const { mutateAsync: startFbUpload, isError: fbUploadError } = trpc.useMutation([
    'uploadClip.startFbUpload'
  ]);

  const {
    mutateAsync: upsertAccount,
    error: accountError,
    isLoading: accountLoading
  } = trpc.useMutation(['setting.createOrUpdate'], {
    onSuccess: () => {
      queryClient.invalidateQueries(['setting.getAccounts']);
    }
  });

  const {
    mutateAsync: createUpload,
    error: uploadError,
    isLoading: uploadIsLoading
  } = trpc.useMutation('uploadClip.createClip');

  const shouldUpload = useRef(true);

  const [renderError, setRenderError] = useState<OperationErrorState>(
    OPERATION_ERROR_INITIAL_STATE
  );
  const [youtubeError, setYoutubeError] = useState<OperationErrorState>(
    OPERATION_ERROR_INITIAL_STATE
  );
  const [tikTokError, setTikTokError] = useState<OperationErrorState>(
    OPERATION_ERROR_INITIAL_STATE
  );
  const [igError, setIgError] = useState<OperationErrorState>(OPERATION_ERROR_INITIAL_STATE);
  const [fbError, setFbError] = useState<OperationErrorState>(OPERATION_ERROR_INITIAL_STATE);

  const [tiktokProgress, setTiktokProgress] = useState(0);
  const [tiktokUploadComplete, setTiktokUploadComplete] = useState<boolean | null>(null);
  const [youtubeProgress, setYoutubeProgress] = useState(0);
  const [youtubeUploadComplete, setYoutubeUploadComplete] = useState<boolean | null>(null);

  const [igUploadComplete, setIGUploadComplete] = useState<boolean | null>(null);
  const [igProgress, setIGProgress] = useState(0);
  const [fbUploadComplete, setFbUploadComplete] = useState<boolean | null>(null);
  const [fbProgress, setFbProgress] = useState(0);

  const [complete, setComplete] = useState(false);
  const [rendered, setRendered] = useState<boolean | null>(null);
  const [renderProgress, setRenderProgress] = useState(0);

  const isError = youtubeError.error || tikTokError.error;

  const fullYoutubeUpload = async (toSend: Record<string, any>) => {
    console.log('youtube upload hit');
    const ytToken = accounts?.filter((account) => account.provider === 'youtube')[0] || {};
    let newYoutubeToken = await refreshYoutubeToken(ytToken);
    if (newYoutubeToken.isRejected) {
      setYoutubeError((prev) => ({
        ...prev,
        error: true,
        message: newYoutubeToken.error,
        type: 'refreshToken'
      }));
      throw new Error(newYoutubeToken.error);
    }

    const updateYtToken = await upsertAccount({
      type: 'oauth',
      provider: 'youtube',
      providerAccountId: newYoutubeToken.access_token,
      refresh_token: newYoutubeToken.refresh_token ?? undefined,
      access_token: newYoutubeToken.access_token ?? undefined,
      expires_at: parseInt(String(newYoutubeToken.expiry_date / 1000)),
      token_type: 'Bearer',
      scope: newYoutubeToken.scope
    });
    toSend.youtubeToken = updateYtToken;
    return youtubeUpload(toSend);
  };

  const fullTiktokUpload = async (toSend: Record<string, any>) => {
    const ttToken = accounts?.filter((account) => account.provider === 'tiktok')[0].refresh_token;
    let newTiktokSessionId = await refreshTikTokToken(ttToken || '');
    const updateTiktokToken = await upsertAccount({
      type: 'oauth',
      provider: 'tiktok',
      providerAccountId: newTiktokSessionId.open_id,
      refresh_token: newTiktokSessionId.refresh_token ?? null,
      refresh_expires_at: newTiktokSessionId.refresh_expires_in,
      access_token: newTiktokSessionId.access_token ?? null,
      expires_at: newTiktokSessionId.expires_in ?? null,
      token_type: 'Bearer',
      scope: newTiktokSessionId.scope
    });

    toSend.tiktokSessionId = updateTiktokToken;
    return tiktokUpload(toSend);
  };

  const handleSubmit = async () => {
    var p = new FakeProgress({
      timeConstant: 120000,
      autoStart: true
    });

    const progressInterval = setInterval(() => {
      setRenderProgress(p.progress);
    }, 100);

    await checkJobComplete();
    clearInterval(progressInterval);

    initAmplitude();

    const savedFileKey = localStorage.getItem('savedFileKey');
    if (savedFileKey) {
      setRendered(true);
    } else {
      setRendered(false);
      setRenderError({
        error: true,
        message: 'An issue occurred while rendering your clip',
        type: null
      });

      return;
    }

    let fileURL = 'https://file.io/' + savedFileKey;

    let toSend: ToSend = {
      tiktokSessionId: accounts?.filter((account) => account.provider === 'tiktok')[0] as Account,
      youtubeToken: accounts?.filter((account) => account.provider === 'youtube')[0] as Account,
      igToken: accounts?.filter((account) => account.provider === 'instagram')[0] as Account,
      uploadCounter,
      ...youtubeFields,
      platforms,
      fileURL
    };

    let responses: SocialResponse = {};
    if (!platforms) return;
    let anythingFailed = false;

    if (platforms.includes('Instagram') && providers.includes('instagram')) {
      var p = new FakeProgress({
        timeConstant: 40000,
        autoStart: true
      });
      let interval = setInterval(() => {
        setIGProgress(p.progress);
      }, 100);
      try {
        responses.Instagram = await IGUpload(toSend);
        if (session) {
          logEvent(
            'ig_upload_successful',
            {
              ...responses.Instagram,
              ...toSend
            },
            session
          );
        }
        setIGUploadComplete(true);
      } catch (e: any) {
        console.log('ig upload error', e);
        if (session) {
          logEvent(
            'ig_upload_failed',
            {
              ...responses.Instagram,
              ...toSend
            },
            session
          );
        }
        setIGUploadComplete(false);
        setIgError((prev) => ({
          ...prev,
          error: true,
          message: e?.message,
          type: 'uploadError'
        }));
        anythingFailed = true;
      }
      clearInterval(interval);
    }

    if (platforms.includes('YouTube') && providers.length > 0 && providers.includes('youtube')) {
      var p = new FakeProgress({
        timeConstant: 10000,
        autoStart: true
      });
      let interval = setInterval(() => {
        setYoutubeProgress(p.progress);
      }, 100);
      try {
        responses.Youtube = await fullYoutubeUpload(toSend);

        if (responses.Youtube.youtubePayload.isRejected) {
          console.log('failed to upload youtube clip for ', session?.user?.name);
          setYoutubeError((prev) => ({
            ...prev,
            error: true,
            message: responses.Youtube.youtubePayload.message || 'fuk',
            type: 'uploadError'
          }));
          throw new Error(responses.Youtube.youtubePayload.message);
        }
        if (session) {
          logEvent(
            'yt_upload_successful',
            {
              ...responses.Youtube,
              ...toSend
            },
            session
          );
        }
        setYoutubeUploadComplete(true);
      } catch (e: any) {
        console.log('youtube upload error', e);
        console.log('youtube upload error', e.message);
        if (session) {
          logEvent(
            'yt_upload_failed',
            {
              e,
              ...responses.Youtube,
              ...toSend
            },
            session
          );
        }
        setYoutubeUploadComplete(false);
        setYoutubeError((prev) => ({
          ...prev,
          error: true,
          message: e.message,
          type: 'uploadError'
        }));
        anythingFailed = true;
      }
      clearInterval(interval);
    }

    if (platforms.includes('TikTok') && providers.length > 0 && providers.includes('tiktok')) {
      var p = new FakeProgress({
        timeConstant: 10000,
        autoStart: true
      });
      let interval = setInterval(() => {
        setTiktokProgress(p.progress);
      }, 100);
      try {
        responses.TikTok = await fullTiktokUpload(toSend);
        if (session) {
          logEvent(
            'tt_upload_successful',
            {
              ...responses.TikTok,
              ...toSend
            },
            session
          );
        }
        setTiktokUploadComplete(true);
      } catch (e: any) {
        console.log('tiktok upload error', e);

        if (session) {
          logEvent(
            'tt_upload_failed',
            {
              ...responses.TikTok,
              ...toSend
            },
            session
          );
        }

        setTiktokUploadComplete(false);
        setTikTokError((prev) => ({
          ...prev,
          error: true,
          message: e.response?.data?.message ?? e.message,
          type: 'uploadError'
        }));
        anythingFailed = true;
      }

      clearInterval(interval);
    }

    if (platforms.includes('Facebook') && providers.includes('instagram')) {
      var p = new FakeProgress({
        timeConstant: 40000,
        autoStart: true
      });
      let interval = setInterval(() => {
        setFbProgress(p.progress);
      }, 100);
      try {
        responses.Facebook = await startFbUpload(toSend);

        console.log(responses.Facebook);
        if (session) {
          logEvent(
            'fb_upload_successful',
            {
              ...responses.Facebook,
              ...toSend
            },
            session
          );
        }
        setFbUploadComplete(true);
      } catch (e: any) {
        console.log('fb upload error', e);
        if (session) {
          logEvent(
            'fb_upload_failed',
            {
              ...responses.Facebook,
              ...toSend
            },
            session
          );
        }
        setFbUploadComplete(false);
        setFbError((prev) => ({
          ...prev,
          error: true,
          message: e?.message,
          type: 'uploadError'
        }));
        anythingFailed = true;
      }
      clearInterval(interval);
    }

    if (
      anythingFailed ||
      tiktokUploadComplete === false ||
      youtubeUploadComplete === false ||
      igUploadComplete === false
    ) {
      toast.error(
        <div>
          <h1 className="text-xl text-red-600">Error</h1>
          <p className="text-xs">One or more uploads failed. Sorry about that!</p>
        </div>
      );
      setComplete(true);
    } else {
      setUploadCounter((uploadCounter || 0) + 1);
      setComplete(true);
    }
  };

  const checkJobComplete = async () => {
    const jobId = localStorage.getItem('cropJobId');
    if (!jobId) return;
    const videoLink = await waitForVideoCrop(jobId);
    localStorage.setItem('savedFileKey', videoLink);

    return videoLink;
  };

  useEffect(() => {
    if (shouldUpload.current && accounts && providers.length > 0) {
      shouldUpload.current = false;
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers]);

  const clearStuff = () => {
    localStorage.removeItem('savedFileKey');
    localStorage.removeItem('jobId');
    setYoutubeFields({
      ...youtubeFields,
      caption: '',
      title: '',
      facebookDescription: ''
    });
  };

  const clearStuffAndShowCompletedPopup = async () => {
    const didAnyComplete =
      youtubeUploadComplete || tiktokUploadComplete || igUploadComplete || fbUploadComplete;

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
      uploaded: true,
      status: didAnyComplete ? 'SUCCESS_MANUAL_UPLOAD' : 'FAILED_MANUAL_UPLOAD',
      tiktokUploadComplete: tiktokUploadComplete ?? undefined,
      youtubeUploadComplete: youtubeUploadComplete ?? undefined,
      facebookUploadComplete: fbUploadComplete ?? undefined,
      igUploadComplete: igUploadComplete ?? undefined,
      youtubeStatus:
        youtubeError.error && youtubeError.type ? YoutubeStatusError[youtubeError.type] : undefined,
      tiktokStatus:
        tikTokError.error && tikTokError.type ? YoutubeStatusError[tikTokError.type] : undefined,
      instagramStatus: igError.error && igError.type ? YoutubeStatusError[igError.type] : undefined,
      facebookStatus: fbError.error && fbError.type ? YoutubeStatusError[fbError.type] : undefined
    };

    if (!currentClip || !cropData) {
      logEvent('create_manual_clip_missing_data', uploadData, session!);
    } else {
      await createUpload(uploadData);
      if (uploadError) {
        console.log(uploadError);
        return;
      }
    }

    clearStuff();
    if (!isError) {
      toast.success('Clips have been uploaded successfully');
      if (platforms?.includes('TikTok') && providers.length > 0 && providers.includes('tiktok')) {
        toast.success(
          <div>
            <h1 className="text-xl text-green-600">Tiktok upload</h1>
            <p className="text-xs ">
              The clip has been sent to your Tiktok mobile inbox, which can take up to 2 minutes to
              process.
            </p>
          </div>,
          {
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined
          }
        );
      }
    }
  };

  useEffect(() => {
    if (complete) clearStuffAndShowCompletedPopup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);

  const isInstagramSelected = platforms?.includes('Instagram');
  const isFacebookSelected = platforms?.includes('Facebook');
  const isYouTubeSelected = platforms?.includes('YouTube');
  const isTikTokSelected = platforms?.includes('TikTok');

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-5">
        <h2 className="mb-2 text-center text-4xl font-bold text-violet ">
          Your uploads are {complete ? 'complete!' : 'in progress!'}
        </h2>

        <Show when={youtubeError.error || tikTokError.error || renderError.error}>
          <div className="flex w-1/2 flex-col rounded-lg p-4 text-sm" role="alert">
            <UploadErrorMessage
              youtubeError={youtubeError}
              tiktokError={tikTokError}
              renderError={renderError}
            />
          </div>
        </Show>

        <div className="flex w-1/2 flex-col gap-4 rounded-md bg-grey-200/30 px-12 py-8">
          <div>
            <p className="mb-1 font-bold text-violet">Rendering Video</p>
            <ProgressBar
              baseBgColor="#e1e2fe"
              bgColor="#7B68EE"
              completed={rendered ? 100 : rendered === false ? 0 : Math.round(renderProgress * 100)}
            />
          </div>

          {isInstagramSelected && (
            <div>
              <p className="mb-1 font-bold text-violet">Instagram</p>
              <ProgressBar
                baseBgColor="#e1e2fe"
                bgColor="#7B68EE"
                completed={
                  igUploadComplete
                    ? 100
                    : igUploadComplete === false
                    ? 0
                    : Math.round(igProgress * 100)
                }
              />
            </div>
          )}

          {isYouTubeSelected && (
            <div>
              <p className="mb-1 font-bold text-violet">YouTube</p>
              <ProgressBar
                baseBgColor="#e1e2fe"
                bgColor="#7B68EE"
                completed={
                  youtubeUploadComplete
                    ? 100
                    : youtubeUploadComplete === false
                    ? 0
                    : Math.round(youtubeProgress * 100)
                }
              />
            </div>
          )}

          {isTikTokSelected && (
            <div>
              <p className="mb-1 font-bold text-violet">TikTok</p>
              <ProgressBar
                baseBgColor="#e1e2fe"
                bgColor="#7B68EE"
                completed={
                  tiktokUploadComplete
                    ? 100
                    : tiktokUploadComplete === false
                    ? 0
                    : Math.round(tiktokProgress * 100)
                }
              />
            </div>
          )}

          {isFacebookSelected && (
            <div>
              <p className="mb-1 font-bold text-violet">Facebook</p>
              <ProgressBar
                baseBgColor="#e1e2fe"
                bgColor="#7B68EE"
                completed={
                  fbUploadComplete
                    ? 100
                    : fbUploadComplete === false
                    ? 0
                    : Math.round(fbProgress * 100)
                }
              />
            </div>
          )}
        </div>
      </div>

      <div className="mb-3 mt-20 flex justify-center gap-5">
        <SecondaryButton
          onClick={() => {
            clearStuff();
            router.push('/clips/');
            setCurrentState(states.SELECT);
            setPrevState(states.SELECT);
          }}
        >
          Upload Again
        </SecondaryButton>
      </div>
    </>
  );
};
export default UploadButton;

type UploadErrorMessage = {
  youtubeError: { error: boolean; message: string; type: YouTubeErrorType | null };
  tiktokError: { error: boolean; message: string; type: YouTubeErrorType | null };
  renderError: { error: boolean; message: string; type: YouTubeErrorType | null };
};

const UploadErrorMessage = ({ youtubeError, tiktokError, renderError }: UploadErrorMessage) => {
  return (
    <>
      <Show when={Boolean(renderError.error)}>
        <div className="flex-start mb-2 flex gap-2">
          <ErrorAlert
            className="w-full"
            title="Render failed"
            description={<p>{renderError.message}</p>}
          />
        </div>
      </Show>

      <Show when={Boolean(youtubeError.error && youtubeError.message)}>
        <div className="flex-start mb-2 flex gap-2">
          <ErrorAlert
            className="w-full"
            title="YouTube upload failed"
            description={
              <>
                <p>{youtubeError.message}</p>
                <p>
                  {youtubeError.type === 'refreshToken'
                    ? 'Please try disconnecting and reconnecting your YouTube account in settings. If the issues still persists please report a bug or contact us in discord.'
                    : ''}
                </p>
              </>
            }
          />
        </div>
      </Show>

      <Show when={Boolean(tiktokError.error && tiktokError.message)}>
        <div className="flex-start mb-2 flex gap-2">
          <ErrorAlert
            className="w-full"
            title="TikTok upload failed"
            description={
              <>
                <p>{tiktokError.message}</p>
                <p>
                  {tiktokError.type === 'refreshToken'
                    ? 'Please try disconnecting and reconnecting your TikTok account in settings. If the issues still persists please report a bug or contact us in discord.'
                    : ''}
                </p>
              </>
            }
          />
        </div>
      </Show>
    </>
  );
};

const OPERATION_ERROR_INITIAL_STATE = {
  error: false,
  message: '',
  type: null
} as const;

type OperationErrorState = {
  error: boolean;
  message: string;
  type: YouTubeErrorType | null;
};
