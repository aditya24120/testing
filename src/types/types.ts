import { Prisma } from '@prisma/client';
import { Categories } from '../components/form/ScheduleForm';
export type UserDetails = {
  broadcasterId: number;
  broadcasterType: string;
  creationDate: Date;
  displayName: string;
  name: string;
  type: string;
  views: number;
} | null;

export type UserSettings = {
  userId: string;
  delay?: number;
  minViewCount: number;
  uploadFrequency: number;
  license?: string;
  camCrop?: CropSettings | null;
  screenCrop?: CropSettings | null;
  cropType?: TCropType;
  verticalVideoEnabled: boolean;
  uploadEnabled: boolean;
  defaultApprove: boolean;
  mainTutorialComplete: boolean;
  clipsTutorialComplete: boolean;
  youtubeHashtags?: string[];
  youtubeTags?: string;
  youtubePrivacy?: string;
  youtubeAutoCategorization?: boolean;
  youtubeDescription?: string;
  tiktokHashtags?: string;
  instagramCaption?: string;
  lastUploaded?: Date;
  lastUploadedId?: string;
  lastUploadTiktok?: Date;
  lastUploadYoutube?: Date;
  lastInstagramYoutube?: Date;
  lastUploadedClipYouTube?: string;
  lastUploadedClipTiktok?: string;
  lastUploadedClipInstagram?: string;
  uploadCount?: number;
  selectedPlatforms?: Platforms;
  youtubeCount: number;
  tiktokCount: number;
  instagramCount: number;
  timeOffset?: number;
  scheduleDays?: ScheduleDays | null;
  youtubeCategory?: string;
};

type ScheduleDays = {
  sun: String[];
  mon: String[];
  tue: String[];
  wed: String[];
  thu: String[];
  fri: String[];
  sat: String[];
};

export type TUserWithAccounts = Prisma.UserGetPayload<{
  include: {
    accounts: true;
  };
}>;

export type User = {
  accounts: string[];
  broadcaster_id: string;
  createdAt: Date;
  email: string;
  image: string;
  isAdmin: boolean;
  name: string;
  settings: UserSettings;
  tokens: string[];
  updatedAt: Date;
  _id: string;
  __v?: number;
};

export type CropSettings = {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX?: number;
  scaleY?: number;
  isNormalized?: boolean;
};

export type VideoContainer = {
  height?: number;
  width?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
};

export type Clip = {
  twitch_id: string;
  broadcaster_name: string;
  broadcaster_id: string;
  creator_name: string;
  creator_id: string;
  embed_url: string;
  game_id: string;
  language: string;
  title: string;
  url: string;
  video_id: string;
  view_count: number;
  thumbnail_url: string;
  created_at: string;
  download_url: string;
  autoCaption?: boolean;
};

export type ClipWithYoutube = Clip & {
  youtubePrivacy?: string;
  youtubeCategory?: string;
  youtubeTitle?: string;
  youtubeHashtags?: string[];
  youtubeDescription?: string;
  approved?: boolean;
  scheduled?: boolean;
  uploaded?: boolean;
  caption?: string;
  instagramHashtags?: string[];
  facebookDescription?: string;
  startTime?: number;
  endTime?: number;
  duration?: number;
};

export type TClipFields = {
  caption?: string;
  title?: string;
  privacy?: string;
  description?: string;
  facebookDescription?: string;
};

export type TCropData = {
  camCrop?: CropSettings;
  screenCrop: CropSettings;
  cropType: 'NO_CAM' | 'CAM_TOP' | 'CAM_FREEFORM' | 'FREEFORM';
  startTime: number;
  endTime: number;
};

export interface Account {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string;
  access_token: string;
  expires_at: number;
  refresh_expires_at?: number;
  obtainment_timestamp?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  oauth_token_secret?: string;
  oauth_token?: string;
  pageId?: string;
  pageAccessToken?: string;
}

export interface TLocalStorageYouTubeToken {
  access_token: string;
  expiry_date: number;
  refresh_token?: string;
  scope?: string;
  token_type?: string;
}
export interface TLocalStorageInstagramToken {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  token_type: string;
}
export interface TLocalStorageTiktokToken {
  access_token: string;
  captcha?: string;
  desc_url?: string;
  description?: string;
  error_code?: number;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  scope: string;
  token_type: string;
  open_id: string;
  log_id: string;
}

export type ToSend = {
  tiktokSessionId?: Account;
  youtubeToken?: Account;
  igToken?: Account;
  uploadCounter: number;
  caption?: string;
  title?: string;
  privacy?: string;
  description?: string;
  facebookDescription?: string;
  platforms: UpperPlatforms;
  fileURL: string;
};
export type YoutubePrivacy = 'Public' | 'Unlisted' | 'Private';
export type YoutubeFields = {
  caption?: string;
  title?: string;
  privacy?: YoutubePrivacy;
  description?: string;
  category?: Categories;
  facebookDescription?: string;
};

// export type TCropType = 'no-cam' | 'cam-top' | 'cam-freeform' | 'freeform' | undefined;
export type TCropType = 'NO_CAM' | 'CAM_TOP' | 'CAM_FREEFORM' | 'FREEFORM' | undefined;
export type Platforms = ('youtube' | 'tiktok' | 'instagram')[];
export type UpperPlatforms = ('TikTok' | 'YouTube' | 'Instagram' | 'Facebook')[];
export type ApprovedStatus = 'MANUAL_APPROVE' | 'AUTO_APPROVE' | 'CANCELED';
