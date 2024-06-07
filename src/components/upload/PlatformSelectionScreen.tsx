import { useState, useEffect } from 'react';
import Image from 'next/image';
import NextButtons from '../NextButtons';
import { AccountProviders, useUploadContext } from '../../context/UploadContext';
import { toast } from 'react-toastify';
import { states } from '../../utils/states';
import { trpc } from '../../utils/trpc';
import { useRouter } from 'next/router';
import { UpperPlatforms } from '../../types/types';

import { AiOutlineCheck } from 'react-icons/ai';

const VALID_INPUT_IMG = '/assets/images/Checkbox_Green.svg';
const INVALID_INPUT_IMG = '/assets/images/Checkbox_Red.svg';
const NULL_INPUT_IMG = '/assets/images/Checkbox_Null.svg';

const PlatformSelectionScreen = () => {
  const router = useRouter();
  const {
    nextButtonPressed,
    backButtonPressed,
    setPlatforms,
    platforms,
    allPlatformsLoggedIn,
    setCurrentState,
    setPrevState
  } = useUploadContext();
  const [igSelected, setIGSelected] = useState(false);
  const [tiktokSelected, setTiktokSelected] = useState(false);
  const [youtubeSelected, setYoutubeSelected] = useState(false);
  const [facebookSelected, setFacebookSelected] = useState(false);

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

  const onChangeYoutube = () => {
    setYoutubeSelected(!youtubeSelected);
  };

  const onChangeIG = () => {
    setIGSelected(!igSelected);
  };
  const onChangeFB = () => {
    setFacebookSelected(!facebookSelected);
  };

  const onChangeTiktok = () => {
    setTiktokSelected(!tiktokSelected);
  };
  const onNext = () => {
    // set platforms in context probably
    let newPlatforms: UpperPlatforms = [];
    if (igSelected) newPlatforms.push('Instagram');
    if (facebookSelected) newPlatforms.push('Facebook');
    if (tiktokSelected) newPlatforms.push('TikTok');
    if (youtubeSelected) newPlatforms.push('YouTube');
    setPlatforms(newPlatforms);
    return newPlatforms;
  };

  useEffect(() => {
    if (platforms) {
      setIGSelected(platforms.includes('Instagram'));
      setTiktokSelected(platforms.includes('TikTok'));
      setYoutubeSelected(platforms.includes('YouTube'));
      setFacebookSelected(platforms.includes('Facebook'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onNext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [igSelected, tiktokSelected, youtubeSelected, facebookSelected]);

  return (
    <>
      <h2 className="mb-20 text-center text-2xl font-bold text-violet">Select your platforms</h2>
      <div id="platform" className="flex flex-col items-center justify-center gap-3">
        <label
          htmlFor="youtube"
          className="flex cursor-pointer flex-row items-center gap-5 rounded-lg p-1 transition-colors duration-200 hover:bg-violet-300/20"
        >
          <SelectedIndicator isSelected={youtubeSelected} />

          <h4 className="w-36 text-xl font-bold text-violet">YouTube</h4>
          <input
            type="checkbox"
            className="hidden"
            id="youtube"
            checked={youtubeSelected}
            onChange={onChangeYoutube}
            value="Youtube"
            name="Youtube"
          />
        </label>

        <label
          htmlFor="tiktok"
          className="flex cursor-pointer flex-row items-center gap-5 rounded-lg p-1 transition-colors duration-200 hover:bg-violet-300/20"
        >
          <SelectedIndicator isSelected={tiktokSelected} />

          <h4 className="w-36 text-xl font-bold text-violet">TikTok</h4>
          <input
            type="checkbox"
            className="hidden"
            id="tiktok"
            checked={tiktokSelected}
            onChange={onChangeTiktok}
            value="TikTok"
            name="TikTok"
          />
        </label>

        <label
          htmlFor="instagram"
          className=" flex cursor-not-allowed flex-row items-center gap-5 rounded-lg p-1 transition-colors duration-200 hover:bg-violet-300/20"
        >
          <SelectedIndicator isSelected={igSelected} />

          <h4 className="w-36 text-xl font-bold text-violet">Instagram Reels</h4>
          <input
            type="checkbox"
            className="hidden"
            // id="instagram"
            // checked={igSelected}
            checked={false}
            onChange={onChangeIG}
            value="Instagram"
            name="Instagram"
            disabled={true}
          />
        </label>
        <span className="-mt-4 text-xs text-violet-400">Coming soon!</span>

        <label
          htmlFor="facebook"
          className="flex cursor-not-allowed flex-row items-center gap-5 rounded-lg p-1 transition-colors duration-200 hover:bg-violet-300/20"
        >
          <SelectedIndicator isSelected={facebookSelected} />

          <h4 className="w-36 text-xl font-bold text-violet">Facebook Reels</h4>
          <input
            type="checkbox"
            className="hidden"
            id="facebook"
            // checked={facebookSelected}
            checked={false}
            onChange={onChangeFB}
            value="Facebbok"
            name="Facebbok"
            disabled={true}
          />
        </label>
        <span className="-mt-4 text-xs text-violet-400">Coming soon!</span>
      </div>

      <NextButtons
        nextButtonPressed={() => {
          let newPlatforms = onNext();
          if (newPlatforms.length === 0) {
            toast.error('Please select at least one platform');
            return;
          }

          if (allPlatformsLoggedIn(providers, newPlatforms)) {
            if (
              !platforms?.includes('Instagram') &&
              !platforms?.includes('YouTube') &&
              !platforms?.includes('Facebook')
            ) {
              setCurrentState(states.REVIEW);
              setPrevState(states.DETAILS);
            } else {
              setCurrentState(states.DETAILS);
              setPrevState(states.LOGIN);
            }
          } else {
            nextButtonPressed();
          }
        }}
        backButtonPressed={() => {
          onNext();
          backButtonPressed();
        }}
        showBackButton={false}
      />
    </>
  );
};

export default PlatformSelectionScreen;

const SelectedIndicator = (props: { isSelected: boolean }) => {
  if (props.isSelected) {
    return (
      <div className="flex items-center justify-center rounded-[50%] rounded-tr-[6%] border border-violet bg-violet p-2.5 text-white">
        <AiOutlineCheck className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="text-none flex items-center justify-center rounded-[50%] rounded-tr-none border border-grey-200 bg-transparent p-2.5">
      <AiOutlineCheck className="h-6 w-6" />
    </div>
  );
};
