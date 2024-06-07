import { useContext, useState } from 'react';
import { FiTwitch } from 'react-icons/fi';
import { useRouter } from 'next/router';
import Modal from 'react-modal';
import { ClipContext, UserContextState } from '../../context/ClipContext';
import { trpc } from '../../utils/trpc';
import { MdOutlineError } from 'react-icons/md';
import ErrorAlert from '../alert/ErrorAlert';
import SecondaryButton from '../common/SecondaryButton';

const urlReg = /^(https:\/\/www.twitch.tv\/)?[-a-zA-Z0-9._]{1,256}\/(clip)\/[-a-zA-Z0-9_]*/;
const urlReg2 = /^(https:\/\/clips.twitch.tv\/)[-a-zA-Z0-9_]*/;
const usernameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_]{0,25}$/;

const ClipUrl = ({ showTwitchButton = true }: { showTwitchButton?: boolean }) => {
  const router = useRouter();
  const [error, setError] = useState<boolean>(false);
  const [userError, setUserError] = useState<{ error: boolean; message: string }>({
    error: false,
    message: ''
  });
  const [invalidUsername, setInvalidUsername] = useState<boolean>(false);

  const [url, setUrl] = useState<string>('');
  const [userModal, setUserModal] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');

  const { mutateAsync: getTwitchUserByUsername, isLoading: isLoadingTwitchUser } = trpc.useMutation(
    ['clip.getTwitchUserByUsername']
  );

  const { mutateAsync: getClipsByTwitchUser, isLoading: isLoadingClips } = trpc.useMutation([
    'clip.recentClipsByUsername'
  ]);

  const { setUserClips } = useContext(ClipContext) as UserContextState;

  const getUrlId = (url: string): string => url.substring(url.lastIndexOf('/') + 1);

  const urlValidation = (): boolean => {
    setError(false);
    let valid: boolean = true;

    //empty string
    if (!url) {
      valid = false;
    }
    // incorrect url
    if (!urlReg.test(url) && !urlReg2.test(url)) {
      valid = false;
    }

    if (!valid) setError(true);

    return valid;
  };

  const handleSubmit = () => {
    const valid = urlValidation();
    if (valid) {
      // get id from url
      const id: string = getUrlId(url);
      router.push(`/clips/${id}`);
    }
  };

  const findUserClips = async () => {
    setUserError({ error: false, message: '' });
    setInvalidUsername(false);
    if (!usernameRegex.test(username)) {
      setInvalidUsername(true);
      return;
    }
    if (username) {
      try {
        const twitchUser = await getTwitchUserByUsername(username);
        const clips = await getClipsByTwitchUser(twitchUser.broadcasterId);
        setUserClips(clips, twitchUser.displayName);
        setUserModal(false);
        setUsername('');
      } catch (error: unknown) {
        if (error instanceof Error) {
          setUserError({ error: true, message: error.message });
        }
        return;
      }

      try {
      } catch (error) {
        if (error instanceof Error) {
          setUserError({ error: true, message: error.message });
        }
        return;
      }
    }
  };
  return (
    <>
      {error && (
        <ErrorAlert
          title="Invalid URL"
          description={
            <>
              <p>Make sure the url looks like the following:</p>
              <p className="w-fit rounded-md bg-grey-500/20 px-2 py-1 font-mono text-xs">
                https://clips.twitch.tv/FurtiveMotionlessCucumberFunRun
              </p>
            </>
          }
        />
      )}

      <div className="flex w-full rounded-lg shadow-lg">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mr-0 w-3/4 flex-1 rounded-l-lg border-b border-l border-t border-gray-200 bg-white p-2 px-4 text-violet outline-none"
          placeholder="Enter Clip URL"
        />

        <button
          onClick={handleSubmit}
          className="rounded-r-lg border-b border-r border-t border-gray-200 bg-violet p-2 px-4 text-sm font-bold uppercase text-white hover:enabled:bg-violet-600 md:px-8 md:text-base"
        >
          Import
        </button>
      </div>

      {showTwitchButton && (
        <div className="mt-2 flex w-full items-center justify-end">
          <button
            onClick={() => setUserModal(true)}
            className="flex items-center gap-2 rounded-lg border-2 border-purple-700 bg-purple-700 px-2 py-2 text-sm font-bold text-white shadow-md hover:enabled:border-purple-800 hover:enabled:bg-purple-800 md:px-6 md:text-base"
          >
            <FiTwitch className="h-4 w-4" />
            <span>Twitch</span>
          </button>
        </div>
      )}

      <Modal
        isOpen={userModal}
        ariaHideApp={false}
        style={modalStyles}
        className="border-1 absolute bottom-auto left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 transform rounded-md border-grey-300 bg-white p-4 shadow-inner md:w-1/2"
      >
        <div className="mb-3 flex w-full flex-col items-center md:mb-6">
          <label className="block w-full pr-4 text-2xl font-bold text-violet">Twitch</label>
          <p className="mb-4 w-full capitalize text-gray-400">
            Search for clips by Twitch username
          </p>

          <div className="w-full">
            <div className="shadow-sidebar flex rounded-lg shadow-lg">
              <input
                value={username || ''}
                onChange={(e) => setUsername(e.target.value)}
                className="mr-0 flex-1 rounded-l-lg border-b border-l border-t border-gray-200 bg-white p-2 px-4 text-violet outline-none"
                placeholder="Enter streamer username"
              />
              <button
                disabled={!username || isLoadingTwitchUser || isLoadingClips}
                onClick={findUserClips}
                className="rounded-r-lg border-b border-r border-t border-violet bg-violet p-2 px-8 font-bold uppercase text-white hover:enabled:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingTwitchUser || isLoadingClips ? 'Finding...' : 'Find Clips'}
              </button>
            </div>
          </div>

          {userError.error && (
            <div className="mt-2 w-full">
              <ErrorAlert
                title="Error"
                description={<p className="capitalize">{userError.message}</p>}
              />
            </div>
          )}

          {invalidUsername && (
            <div className="w-full">
              <ErrorAlert
                title="Invalid Username"
                description={<p>Username must only contain letters, numbers, and underscores.</p>}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <SecondaryButton onClick={() => setUserModal(false)}>Cancel</SecondaryButton>
        </div>
      </Modal>
    </>
  );
};

export default ClipUrl;

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  }
};
