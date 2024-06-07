import { useState, useEffect } from 'react';
import NextButtons from '../NextButtons';
import { AccountProviders, useUploadContext } from '../../context/UploadContext';
import { states } from '../../utils/states';
import TextInput from '../form/TextInput';
import DropDownInput from '../form/DropDownInput';
import { toast } from 'react-toastify';
import { trpc } from '../../utils/trpc';
import { useRouter } from 'next/router';
import InfoAlert from '../alert/InfoAlert';

const CATEGORIES = [
  'Film & Animation',
  'Autos & Vehicles',
  'Music',
  'Pets & Animals',
  'Sports',
  'Travel & Events',
  'Gaming',
  'People & Blogs',
  'Comedy',
  'Entertainment',
  'News & Politics',
  'Howto & Style',
  'Education',
  'Science & Technology',
  'Nonprofits & Activism'
];

const DetailsScreen = () => {
  const router = useRouter();
  // const [detailsValid, setDetailsValid] = useState(false)

  const {
    youtubeFields,
    setYoutubeFields,
    nextButtonPressed,
    backButtonPressed,
    setPrevState,
    setCurrentState,
    allPlatformsLoggedIn,
    platforms
  } = useUploadContext();

  const [providers, setProviders] = useState<AccountProviders[]>([]);
  const [ytDescUpdated, setYtDescUpdated] = useState<boolean>(false);

  const { data: settingsAndAccounts, isLoading } = trpc.useQuery(['user.getAccountsAndSettings'], {
    onSuccess: (data) => {
      setProviders(data.accounts as AccountProviders[]);
    },
    onError: (error) => {
      console.log('error me: ', error.data?.code);
      if (error.data?.code === 'UNAUTHORIZED') {
        router.push('/');
      }
    }
  });

  const storeNewYoutubeField = (fieldName: string, fieldValue: string) => {
    if (fieldName === 'description') {
      setYtDescUpdated(true);
    }
    setYoutubeFields({
      ...youtubeFields,
      [fieldName]: fieldValue
    });
  };

  const detailsValid = () => {
    let valid = true;
    if (platforms?.includes('Instagram')) {
      if (youtubeFields?.caption === '') valid = false;
    }
    if (platforms?.includes('Facebook')) {
      if (!youtubeFields?.facebookDescription) valid = false;
    }
    if (platforms?.includes('YouTube')) {
      if (youtubeFields?.title === '' || youtubeFields?.description === '') valid = false;
    }
    if (!valid) toast.error('Please fill in all fields');

    return valid;
  };

  const isFacebookSelected = platforms?.includes('Facebook');
  const isInstagramSelected = platforms?.includes('Instagram');
  const isYoutubeSelected = platforms?.includes('YouTube');

  return (
    <>
      <h2 className="mb-2 text-center text-2xl font-bold text-violet">Add your video info</h2>

      <div className="mx-auto mb-10 w-fit">
        <InfoAlert
          description={
            <p className="text-base text-violet-300">
              Due to TikTok rules, the title and description must be set within the TikTok app.
            </p>
          }
        />
      </div>

      <div className="flex w-full flex-col items-center justify-center md:flex-row md:items-start">
        {isInstagramSelected && (
          <div id="igStuff" className={`w-full md:w-1/2 ${!isInstagramSelected && 'hidden'}`}>
            <TextInput
              initialValue={youtubeFields?.caption}
              platform="Instagram"
              isTextArea={true}
              onUpdate={storeNewYoutubeField}
              label="Caption"
              placeholder="Check out Clipbot at clipbot.tv! Follow me on twitter!"
            />
          </div>
        )}

        {isFacebookSelected && (
          <div id="fbStuff" className={`w-full md:w-1/2 ${!isFacebookSelected && 'hidden'}`}>
            <TextInput
              initialValue={youtubeFields?.facebookDescription}
              isTextArea={true}
              onUpdate={storeNewYoutubeField}
              label="Facebook Description"
              placeholder="Check out Clipbot at clipbot.tv! Follow me on twitter!"
            />
          </div>
        )}

        {isYoutubeSelected && (
          <div id="ytStuff" className="w-full md:w-1/2">
            <TextInput
              initialValue={youtubeFields?.title}
              platform="YouTube"
              onUpdate={storeNewYoutubeField}
              label="Title"
              placeholder="How Clipbot Works"
            />

            <TextInput
              initialValue={
                settingsAndAccounts?.settings.youtubeDescription && !ytDescUpdated
                  ? settingsAndAccounts?.settings.youtubeDescription
                  : youtubeFields?.description
              }
              platform="YouTube"
              isTextArea={true}
              onUpdate={storeNewYoutubeField}
              label="Description"
              placeholder="Check out Clipbot at clipbot.tv! Follow me on twitter!"
            />

            <DropDownInput
              onUpdate={storeNewYoutubeField}
              platform="YouTube"
              label="Category"
              defaultOption={youtubeFields?.category || 'Gaming'}
              doLowercase={false}
              options={CATEGORIES}
            />

            <DropDownInput
              onUpdate={storeNewYoutubeField}
              platform="YouTube"
              label="Privacy"
              defaultOption={youtubeFields?.privacy || 'Private'}
              doLowercase={true}
              options={['Public', 'Unlisted', 'Private']}
            />
          </div>
        )}
      </div>

      <NextButtons
        nextButtonPressed={() => {
          // onNext(formRef.current as HTMLFormElement);
          if (detailsValid()) {
            nextButtonPressed();
          }
        }}
        backButtonPressed={() => {
          if (allPlatformsLoggedIn(providers)) {
            setCurrentState(states.SELECT);
            setPrevState(states.DETAILS);
          } else {
            backButtonPressed();
          }
        }}
      />
    </>
  );
};
export default DetailsScreen;
