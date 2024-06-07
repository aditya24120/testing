import React, { Dispatch, SetStateAction, createContext, useState, useEffect } from 'react';
import { Clip, ClipWithYoutube, TCropData } from '../types/types';

export interface UserContextState {
  clips: ClipWithYoutube[] | Clip[] | [];
  currentClip: Clip | undefined;
  cropData: TCropData | undefined;
  isLoading?: boolean;
  currentUsername: string | null;
  previousUsername: string | null;
  scheduleClip: boolean;
  addClip: (clip: Clip) => void;
  getClips: (id: number) => void;
  setUserClips: (clips: Clip[], username?: string) => void;
  setCurrentClip: Dispatch<SetStateAction<Clip | undefined>>;
  setCropData: Dispatch<SetStateAction<TCropData | undefined>>;
  setCurrentUsername: Dispatch<SetStateAction<string>>;
  updateCurrentUser: (username: string) => void;
  setScheduleClip: Dispatch<SetStateAction<boolean>>;
}

interface Props {
  children: React.ReactNode;
}

export const ClipContext = createContext<UserContextState | null>(null);

const ClipProvider: React.FC<Props> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clips, setClips] = useState<Clip[]>([]);
  const [currentClip, setCurrentClip] = useState<Clip>();
  const [cropData, setCropData] = useState<TCropData>();
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [previousUsername, setPreviousUsername] = useState<string>('');
  const [scheduleClip, setScheduleClip] = useState<boolean>(false);

  useEffect(() => {
    const lastClip = localStorage.getItem('currentClip');
    if (typeof lastClip === 'string') {
      setCurrentClip(JSON.parse(lastClip));
    }
  }, []);

  const addClip = (clip: Clip) => {
    const newClip: Clip = {
      twitch_id: 'BadDrabLasagnaKeepo-L_e9JmmXT6WvQPqo',
      broadcaster_name: 'Roxkstar74',
      broadcaster_id: '32985385',
      creator_name: 'funkjc',
      creator_id: '540627551',
      embed_url: 'https://clips.twitch.tv/embed?clip=BadDrabLasagnaKeepo-L_e9JmmXT6WvQPqo',
      game_id: '1469308723',
      language: 'en',
      title: 'WEB DEV LIVE FROM PORTUGAL !today !mattress !portugal',
      url: 'https://clips.twitch.tv/BadDrabLasagnaKeepo-L_e9JmmXT6WvQPqo',
      video_id: '1481903182',
      view_count: 1,
      thumbnail_url:
        'https://clips-media-assets2.twitch.tv/39322548855-offset-2958-preview-480x272.jpg',
      created_at: '2022-05-12T15:53:41.000Z',
      download_url: 'https://clips-media-assets2.twitch.tv/39322548855-offset-2958.mp4'
    };
    setClips([...clips, newClip]);
  };

  const getClips = () => {
    //TODO get current clips list
    console.log(clips);
  };

  const updateCurrentUser = (username: string) => {
    setPreviousUsername(currentUsername);
    setCurrentUsername(username);
  };

  const setUserClips = (clips: Clip[], username?: string) => {
    if (username) {
      updateCurrentUser(username);
    }
    setClips(clips);
  };

  return (
    <ClipContext.Provider
      value={{
        clips,
        currentClip,
        cropData,
        setCropData,
        isLoading,
        currentUsername,
        previousUsername,
        setCurrentUsername,
        addClip,
        getClips,
        setUserClips,
        updateCurrentUser,
        setCurrentClip,
        scheduleClip,
        setScheduleClip
      }}
    >
      {children}
    </ClipContext.Provider>
  );
};

export default ClipProvider;
