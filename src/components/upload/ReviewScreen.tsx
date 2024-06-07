import NextButtons from '../NextButtons';
import { AccountProviders, useUploadContext } from '../../context/UploadContext';
import { useCallback, useEffect, useState } from 'react';
import { states } from '../../utils/states';
import { trpc } from '../../utils/trpc';
import { useRouter } from 'next/router';
import InfoAlert from '../alert/InfoAlert';

const ReviewScreen = () => {
  const router = useRouter();
  const [providers, setProviders] = useState<AccountProviders[]>([]);

  const {
    data: accounts,
    isLoading,
    refetch
  } = trpc.useQuery(['setting.getAccounts'], {
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

  const { mutateAsync: getIgUsername } = trpc.useMutation('setting.getInstagramUsername');
  const { mutateAsync: updateUsername } = trpc.useMutation('setting.setUsername');
  const {
    youtubeFields,
    nextButtonPressed,
    backButtonPressed,
    setPrevState,
    setCurrentState,
    usernames,
    platforms
  } = useUploadContext();

  const instgramAccount = accounts?.filter((acc) => acc.provider === 'instagram')[0];
  const IgUsername = instgramAccount?.username || 'Connected';
  const tiktokAccount = accounts?.filter((acc) => acc.provider === 'instagram')[0];
  const TTUsername = tiktokAccount?.username || 'Connected';

  const IgUserName = useCallback(async () => {
    if (!instgramAccount?.access_token) return;

    const username = await getIgUsername({ token: instgramAccount?.access_token });
    updateUsername({ provider: 'instagram', username });
    return username;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (instgramAccount && !instgramAccount?.username) {
      IgUserName();
    }
  }, [instgramAccount, IgUserName]);

  const isInstagramSelected = platforms?.includes('Instagram');
  const isFacebookSelected = platforms?.includes('Facebook');
  const isYouTubeSelected = platforms?.includes('YouTube');
  const isTikTokSelected = platforms?.includes('TikTok');

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="mb-2 text-center text-2xl font-bold text-violet">Review your video info</h2>

      <div className="mb-20">
        <InfoAlert
          description={
            <p className="text-center text-base text-violet-300">
              Due to TikTok rules, the title and description must be set within the TikTok app.
            </p>
          }
        />
      </div>

      <div className="flex w-full flex-col items-start justify-around md:w-4/5 md:flex-row">
        <div id="logins" className="w-full md:w-1/3">
          <h2 className="mb-3 text-xl font-bold text-violet md:mb-10">Selected Platforms</h2>
          <div
            id="platform"
            className="flex flex-col items-start justify-center divide-y-2 divide-slate-200 rounded-lg bg-violet shadow-md"
          >
            {isInstagramSelected && (
              <label
                htmlFor="instagram"
                className="flex w-full flex-row items-center gap-5 rounded-t-lg p-4 transition-colors duration-200"
              >
                <div className="flex flex-col">
                  <h4 className="text-white">Instagram</h4>
                  <p className="text-xl font-bold text-white">{IgUsername || 'Connected'}</p>
                </div>
              </label>
            )}

            {isFacebookSelected && (
              <label
                htmlFor="facebook"
                className="flex w-full flex-row items-center gap-5 rounded-t-lg p-4 transition-colors duration-200"
              >
                <div className="flex flex-col">
                  <h4 className="text-white">Facebook</h4>
                  <p className="text-xl font-bold text-white">
                    {usernames?.facebook || 'Connected'}
                  </p>
                </div>
              </label>
            )}

            {isYouTubeSelected && (
              <label
                htmlFor="youtube"
                className="flex w-full flex-row items-center gap-5 rounded-t-lg p-4 transition-colors duration-200"
              >
                <div className="flex flex-col">
                  <h4 className="text-white">YouTube</h4>
                  <p className="text-xl font-bold text-white">
                    {usernames?.youtube || 'Connected'}
                  </p>
                </div>
              </label>
            )}

            {isTikTokSelected && (
              <label
                htmlFor="tiktok"
                className="flex w-full flex-row items-center gap-5 rounded-b-sm rounded-t-lg p-4 transition-colors duration-200"
              >
                <div className="flex flex-col">
                  <h4 className="text-white">TikTok</h4>
                  <p className="text-xl font-bold text-white">{TTUsername || 'Connected'}</p>
                </div>
              </label>
            )}
          </div>
        </div>

        {(isYouTubeSelected || isInstagramSelected || isFacebookSelected) && (
          <div id="fields" className="mt-3 w-full text-violet md:mt-0 md:w-1/2">
            {isInstagramSelected && (
              <div className="mb-6 w-full flex-col md:flex md:items-center">
                <label className="mb-2 block w-4/5 pr-4 text-xl font-bold">Instagram Caption</label>
                <div className="w-4/5 text-base">{youtubeFields?.caption}</div>
              </div>
            )}

            {isYouTubeSelected && (
              <div className="text-violet">
                <div className="mb-6 w-full flex-col md:flex md:items-center">
                  <label className="mb-2 block w-4/5 pr-4 text-xl font-bold">YouTube Title</label>
                  <div className="w-4/5 text-base">{youtubeFields?.title}</div>
                </div>

                <div className="mb-6 w-full flex-col md:flex md:items-center">
                  <label className="mb-2 block w-4/5 pr-4 text-xl font-bold">
                    YouTube Description
                  </label>
                  <div className="w-4/5 text-base">{youtubeFields?.description}</div>
                </div>

                <div className="mb-6 w-full flex-col md:flex md:items-center">
                  <label className="mb-2 block w-4/5 pr-4 text-xl font-bold">
                    YouTube Category
                  </label>
                  <div className="w-4/5 text-base">{youtubeFields?.category || 'Gaming'}</div>
                </div>

                <div className="mb-6 w-full flex-col md:flex md:items-center">
                  <label className="mb-2 block w-4/5 pr-4 text-xl font-bold">YouTube Privacy</label>
                  <div className="w-4/5 text-base">{youtubeFields?.privacy || 'private'}</div>
                </div>
              </div>
            )}

            {isFacebookSelected && (
              <div className="text-violet">
                <div className="mb-6 w-full flex-col md:flex md:items-center">
                  <label className="mb-2 block w-4/5 pr-4 text-xl font-bold">
                    Facebook Description
                  </label>
                  <div className="w-4/5 text-base">{youtubeFields?.facebookDescription}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <NextButtons
        nextButtonPressed={() => nextButtonPressed()}
        backButtonPressed={() => {
          if (platforms?.includes('TikTok') && platforms.length == 1) {
            setCurrentState(states.SELECT);
            setPrevState(states.SELECT);
          } else {
            backButtonPressed();
          }
        }}
      />
    </div>
  );
};
export default ReviewScreen;
