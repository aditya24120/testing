import { createContext, useContext, useState, useEffect, Dispatch, SetStateAction } from 'react';
// @ts-ignore
import * as FB from 'fb-sdk-wrapper';
import { states, statesInOrder } from '../utils/states';
import { UpperPlatforms, YoutubeFields } from '../types/types';

export type AccountProviders = 'youtube' | 'tiktok' | 'instagram' | 'twitch';

type UploadContext = {
  uploadCounter: number;
  setUploadCounter: (uploadCounter: number) => void;
  youtubeFields?: YoutubeFields;
  setYoutubeFields: (youtubeFields: Record<string, string>) => void;
  currentState: string;
  setCurrentState: (currentState: string) => void;
  prevState?: string;
  setPrevState: (prevState: string) => void;
  nextButtonPressed: () => void;
  backButtonPressed: () => void;
  platforms: UpperPlatforms;
  setPlatforms: Dispatch<SetStateAction<UpperPlatforms>>;
  allPlatformsLoggedIn: (accountProviders: AccountProviders[], newPlatforms?: string[]) => boolean;
  usernames?: Record<string, string>;
  setUsernames: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  uuid: string;
  setUuid: (uuid: string) => void;
};

const Context = createContext<UploadContext>({
  uploadCounter: 0,
  setUploadCounter: () => {},
  youtubeFields: {},
  setYoutubeFields: () => {},
  currentState: '',
  setCurrentState: () => {},
  prevState: '',
  setPrevState: () => {},
  nextButtonPressed: () => {},
  backButtonPressed: () => {},
  platforms: [],
  setPlatforms: () => {},
  allPlatformsLoggedIn: () => {
    return false;
  },
  usernames: {},
  setUsernames: () => {},
  uuid: '',
  setUuid: () => {}
});

let storedFields = ['youtubeFields', 'currentState', 'prevState', 'platforms', 'usernames'];

const FB_ID = process.env.NEXT_PUBLIC_FB_APP_ID;

interface Props {
  children: React.ReactNode;
}

export const UploadContext: React.FC<Props> = ({ children }) => {
  const [uploadCounter, setUploadCounter] = useState(0);
  const [youtubeFields, setYoutubeFields] = useState<Record<string, string> | undefined>();
  const [currentState, setCurrentState] = useState('');
  const [prevState, setPrevState] = useState('');
  const [platforms, setPlatforms] = useState<UpperPlatforms>([]);
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [uuid, setUuid] = useState('');

  const nextButtonPressed = () => {
    if (currentState) {
      let currentStateIndex = statesInOrder.indexOf(currentState);
      let nextState = statesInOrder[currentStateIndex + 1];

      setPrevState(currentState);
      setCurrentState(nextState);
    }
  };

  const backButtonPressed = () => {
    if (currentState) {
      setPrevState(currentState);
      let currentStateIndex = statesInOrder.indexOf(currentState);
      if (currentStateIndex > 0) {
        let nextState = statesInOrder[currentStateIndex - 1];

        setCurrentState(nextState);
      }
    }
  };

  const allPlatformsLoggedIn = (accountProviders: AccountProviders[], newPlatforms?: string[]) => {
    const includesTiktok = accountProviders.includes('tiktok');
    const includesYoutube = accountProviders.includes('youtube');
    const includesInstagram = accountProviders.includes('instagram');

    let tempPlatforms = newPlatforms || platforms;
    if (!tempPlatforms) return false;
    if (tempPlatforms.includes('TikTok') && !includesTiktok) return false;
    if (tempPlatforms.includes('YouTube') && !includesYoutube) return false;
    if (tempPlatforms.includes('Instagram') && !includesInstagram) return false;
    if (tempPlatforms.includes('Facebook') && !includesInstagram) return false;

    return true;
  };

  useEffect(() => {
    const storedValues: Record<string, string> = {};
    for (let field of storedFields) {
      let value = localStorage.getItem(field);
      if (value) {
        storedValues[field] = value;
      }
    }

    FB.load().then(() => {
      FB.init({
        appId: FB_ID,
        version: 'v15.0'
      });
    });

    if (storedValues.uploadCounter) setUploadCounter(parseInt(String(storedValues.uploadCounter)));
    if (storedValues.youtubeFields) setYoutubeFields(JSON.parse(storedValues.youtubeFields));
    if (storedValues.currentState) {
      if (storedValues.currentState === states.FINISH) {
        setCurrentState(states.SELECT);
        setPrevState(states.SELECT);
      } else {
        setCurrentState(storedValues.currentState);
        if (storedValues.prevState) setPrevState(storedValues.prevState);
      }
    } else {
      setCurrentState(states.SELECT);
      setPrevState(states.SELECT);
    }
    if (storedValues.platforms) setPlatforms(JSON.parse(storedValues.platforms));
    if (storedValues.usernames) setUsernames(JSON.parse(storedValues.usernames));
    if (storedValues.uuid) setUuid(storedValues.uuid);
    else {
      let uuid = Math.round(Math.random() * 1000000000);
      setUuid(uuid.toString());
    }
  }, []);

  useEffect(() => {
    if (uuid) localStorage.setItem('uuid', uuid);
  }, [uuid]);

  useEffect(() => {
    if (uploadCounter) localStorage.setItem('uploadCounter', uploadCounter.toString());
  }, [uploadCounter]);

  useEffect(() => {
    if (youtubeFields && Object.keys(youtubeFields).length > 0)
      localStorage.setItem('youtubeFields', JSON.stringify(youtubeFields));
  }, [youtubeFields]);

  useEffect(() => {
    if (currentState) localStorage.setItem('currentState', currentState);
  }, [currentState]);

  useEffect(() => {
    if (prevState) localStorage.setItem('prevState', prevState);
  }, [prevState]);

  useEffect(() => {
    if (usernames && Object.keys(usernames).length > 0)
      localStorage.setItem('usernames', JSON.stringify(usernames));
  }, [usernames]);

  useEffect(() => {
    if (platforms && platforms.length > 0) {
      const removeFB = platforms.filter((p) => {
        if (p === 'Facebook') return false;
        if (p === 'Instagram') return false;
        return true;
      });
      localStorage.setItem('platforms', JSON.stringify(removeFB));
    }
  }, [platforms]);

  return (
    <Context.Provider
      value={{
        uploadCounter,
        setUploadCounter,
        youtubeFields,
        setYoutubeFields,
        currentState,
        setCurrentState,
        prevState,
        setPrevState,
        platforms,
        setPlatforms,
        usernames,
        setUsernames,
        uuid,
        setUuid,
        allPlatformsLoggedIn,
        nextButtonPressed,
        backButtonPressed
      }}
    >
      {children}
    </Context.Provider>
  );
};

export const useUploadContext = () => useContext(Context);
