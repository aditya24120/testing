import React, { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import { Clip } from '../../types/types';
import ErrorAlert from '../alert/ErrorAlert';

const urlReg = /^(https:\/\/www.twitch.tv\/)?[-a-zA-Z0-9._]{1,256}\/(clip)\/[-a-zA-Z0-9_]*/;
const urlReg2 = /^(https:\/\/clips.twitch.tv\/)[-a-zA-Z0-9_]*/;

function stringOrNull(str: unknown) {
  if (typeof str === 'string') {
    return str;
  }
  return null;
}

const SelectClipUrl = ({ setSelectedClip }: { setSelectedClip: (clip: Clip) => void }) => {
  const router = useRouter();
  const [error, setError] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('');
  const [clipId, setClipId] = useState<string>();
  const getUrlId = (url: string): string => url.substring(url.lastIndexOf('/') + 1);

  const {
    data,
    error: clipError,
    isLoading,
    isFetching
  } = trpc.useQuery(['clip.getClipById', clipId!], {
    enabled: Boolean(clipId),
    onSuccess: (data) => {
      if (data) {
        setSelectedClip(data);
      }
    }
  });

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
      setClipId(id);
    }
  };

  return (
    <>
      {clipError && (
        <ErrorAlert title="Clip not found" description={<p>Please check the url is correct</p>} />
      )}

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

      <div className="flex rounded-md shadow-lg shadow-grey-200">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mr-0 flex-1 rounded-l-lg border border-grey-200 bg-white p-2 px-4 text-grey-700 outline-none"
          placeholder="Enter Clip Url"
        />

        <button
          onClick={handleSubmit}
          disabled={isFetching}
          className="rounded-r-lg bg-violet p-2 px-8 font-bold uppercase text-white hover:enabled:opacity-80"
        >
          {isFetching ? 'Loading...' : 'Get Clip'}
        </button>
      </div>
    </>
  );
};
export default SelectClipUrl;
