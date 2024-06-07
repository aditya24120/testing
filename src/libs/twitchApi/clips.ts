import { apiClientConnect } from './apiClient';
import { Clip as ClipType, TUserWithAccounts } from '../../types/types';
import { HelixClip } from '@twurple/api/lib';

type TwurpleClip = {
  id: string;
  broadcasterDisplayName: string;
  broadcasterId: string;
  creatorDisplayName: string;
  creatorId: string;
  embedUrl: string;
  gameId: string;
  language: string;
  title: string;
  url: string;
  videoId: string;
  views: number;
  duration: number;
  thumbnailUrl: string;
  creationDate: Date;
};

export const previous14Date = (startDate?: string) => {
  const start = startDate ? new Date(startDate) : new Date();
  const priorDate = start.setDate(start.getDate() - 14);
  const ISO = new Date(priorDate).toISOString();

  return ISO;
};

const daysOfYearArray = (mostRecentClipPostedCreatedAtTime: string) => {
  let now = new Date();
  let nextDate = new Date().setDate(now.getDate() + 1);
  let tomorrow = new Date(nextDate);
  let daysOfYear = [];
  for (
    let d = new Date(mostRecentClipPostedCreatedAtTime);
    d <= tomorrow;
    d.setDate(d.getDate() + 1)
  ) {
    daysOfYear.push(new Date(d));
  }
  console.log('Day arr length: ' + daysOfYear.length);
  return daysOfYear;
};
const fixTheFreakingNames = (
  clips: TwurpleClip[],
  userId?: string
): (ClipType & { userId?: string })[] => {
  return clips.map((clip) => {
    return {
      twitch_id: clip.id,
      broadcaster_name: clip.broadcasterDisplayName,
      broadcaster_id: clip.broadcasterId,
      creator_name: clip.creatorDisplayName,
      creator_id: clip.creatorId,
      embed_url: clip.embedUrl,
      game_id: clip.gameId,
      language: clip.language,
      title: clip.title,
      url: clip.url,
      video_id: clip.videoId,
      view_count: clip.views,
      thumbnail_url: clip.thumbnailUrl,
      created_at: clip.creationDate.toISOString(),
      download_url: clip.thumbnailUrl.split('-preview-')[0] + '.mp4',
      userId: userId,
      duration: clip.duration
    };
  });
};

const sortClipsByCreationDate = (clips: ClipType[]) => {
  return clips.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
};

const filterClipsByCurrentSettings = (clips: ClipType[]) => {
  return (
    clips
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      // .filter((x) => x.created_at > getCurrentState()?.lastUploadCreatedAtDate)
      .filter((x) => x.created_at > new Date(2010, 0, 1).toISOString())
      .map((clipBlob) => {
        // convert thumbnail url to actual url
        clipBlob.download_url = clipBlob.thumbnail_url.split('-preview-')[0] + '.mp4';
        return clipBlob;
      })
  );
};

export const getClipsStartingAtCertainDateFromTwitchAPI = async (
  broadcasterId: string,
  user?: TUserWithAccounts,
  date?: string,
  doSort: boolean = true
) => {
  console.log('gettin more clips');
  // let mostRecentClipPostedCreatedAtTime = new Date(2010, 0, 1).toISOString()
  let mostRecentClipPostedCreatedAtTime = previous14Date(date);
  console.log('Most recent clip posted created at time: ' + mostRecentClipPostedCreatedAtTime);
  const daysOfYear = daysOfYearArray(mostRecentClipPostedCreatedAtTime);

  let clips: TwurpleClip[] = [];

  let jumpSize = 1;
  let lastEndDateIndex = 0;
  let totalClipsFoundSoFar = 0;
  for (let i = jumpSize; i < daysOfYear.length; i = Math.min(i + jumpSize, daysOfYear.length - 1)) {
    console.log('i: ' + i);
    let startDate =
      daysOfYear[lastEndDateIndex] > daysOfYear[i - jumpSize + 1]
        ? daysOfYear[lastEndDateIndex]
        : daysOfYear[i - jumpSize + 1];
    if (lastEndDateIndex == 0) {
      startDate = daysOfYear[0];
    }
    let endDate = new Date(daysOfYear[i]);
    endDate.setUTCHours(
      endDate.getUTCHours() + 23,
      endDate.getUTCMinutes() + 59,
      endDate.getUTCSeconds() + 59,
      endDate.getUTCMilliseconds() + 999
    );
    const api = await apiClientConnect(user);

    if (api == undefined) {
      console.log('API is undefined, getting no new clips');
      return [];
    }
    let newClips = await api.clips
      .getClipsForBroadcasterPaginated(broadcasterId, {
        limit: 100000,
        startDate: startDate, //whichever is later in life to avoid overlap
        endDate: endDate
      })
      .getAll();

    console.log('Jump size: ' + jumpSize);
    console.log(
      `Clips from ${startDate.toISOString()} until ${endDate.toISOString()}:` + newClips.length
    );

    if (newClips.length > 900) {
      i -= jumpSize;
      jumpSize = 2;
      console.log('backing up');
      continue;
    } else {
      lastEndDateIndex = i + 1;
      jumpSize += 1;
    }
    clips.push(newClips);
    totalClipsFoundSoFar += newClips.length;
    // updateStatus('LOADING NEW TWITCH CLIPS: ' + totalClipsFoundSoFar)
    console.log(
      'Unique clips in twitch output: ' + new Set(newClips.map((x: TwurpleClip) => x.id)).size
    );

    if (i == daysOfYear.length - 1) {
      console.log('Got to end');
      break;
    }
  }

  console.log('Checked clips starting at: ' + mostRecentClipPostedCreatedAtTime);
  let recentClips: TwurpleClip[] = clips.flatMap((x) => x); //clips.data.data;
  console.log('fuck idk: ' + JSON.stringify({ ...recentClips[0] }));
  console.log('all clips length pre unique: ' + recentClips.length);

  if (recentClips.length == 0) {
    return [];
  }
  let uniqueIds = new Set(recentClips.map((x) => x.id));
  recentClips = recentClips.filter((x) => uniqueIds.has(x.id));
  let fixedRecentClips = fixTheFreakingNames(recentClips); // i hate libraries
  console.log('all clips length: ' + recentClips.length);

  // we mostly do this so we force in the download_url field
  if (doSort) {
    fixedRecentClips = filterClipsByCurrentSettings(fixedRecentClips);
  } else {
    fixedRecentClips = sortClipsByCreationDate(fixedRecentClips);
  }

  // updateStatus('Done finding clips')
  console.log('sorted clips length: ' + recentClips.length);
  console.log('new clip ids: ', uniqueIds);

  // fixedRecentClips = await saveClips(recentClips, user);

  return fixedRecentClips;
};

export const getRecentClips = async (
  userId: string,
  startDate?: string,
  endDate?: string,
  user?: TUserWithAccounts
) => {
  try {
    const api = await apiClientConnect(user);
    if (api == undefined) {
      console.log('API is undefined, getting no new clips');
      return [];
    }
    //32985385 rox
    let request = await api.clips.getClipsForBroadcasterPaginated(userId, {
      startDate: startDate ? new Date(startDate).toISOString() : previous14Date(),
      endDate: endDate
        ? new Date(endDate).toISOString()
        : new Date(new Date().setHours(23, 59, 59, 999)).toISOString()
    });

    let page: HelixClip[];
    const result: HelixClip[] = [];

    while ((page = await request.getNext()).length) {
      result.push(...page);
    }

    let recentClips: TwurpleClip[] = result.flatMap((x: TwurpleClip) => x);
    let uniqueIds = new Set(recentClips.map((x) => x.id));
    recentClips = recentClips.filter((x) => uniqueIds.has(x.id));

    let fixedRecentClips = fixTheFreakingNames(recentClips, user?.id);
    fixedRecentClips = sortClipsByCreationDate(fixedRecentClips);

    return fixedRecentClips;
  } catch (error) {
    console.log(error);
    throw Error('error');
  }
};

export const getPopularClips = async (user: TUserWithAccounts) => {
  try {
    const api = await apiClientConnect(user);

    if (api == undefined) {
      console.log('API is undefined, getting no new clips');
      return [];
    }
    const request = await api.clips.getClipsForBroadcaster(user.accounts[0]?.providerAccountId, {
      limit: 30
    });

    if (!request) return null;

    let recentClips: TwurpleClip[] = request.data.flatMap((x: TwurpleClip) => x);
    let uniqueIds = new Set(recentClips.map((x) => x.id));
    recentClips = recentClips.filter((x) => uniqueIds.has(x.id));

    let fixedRecentClips = fixTheFreakingNames(recentClips);
    fixedRecentClips = sortClipsByCreationDate(fixedRecentClips);

    return fixedRecentClips;
  } catch (error) {
    console.log(error);
    throw Error('error');
  }
};

export const getClipById = async (id: string, user?: TUserWithAccounts) => {
  try {
    if (!id) return null;
    const api = await apiClientConnect(user);
    if (api == undefined) {
      console.log('API is undefined, getting no new clips');
      return null;
    }
    let request = await api.clips.getClipById(id);
    if (!request) return null;
    let recentClips: TwurpleClip[] = [request];

    let fixedRecentClips = fixTheFreakingNames(recentClips, user?.id);

    return fixedRecentClips[0];
  } catch (error) {
    console.log(error);
    throw Error('error');
  }
};

export const createClip = async (user: TUserWithAccounts) => {
  try {
    const api = await apiClientConnect(user);
    const twitchUserInfo = await api.users.getUserByName(user.name);

    const createClipRequest = await api.clips.createClip({
      channelId: twitchUserInfo.id,
      createAfterDelay: true
    });

    return createClipRequest;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUserByName = async (username: string, auth?: TUserWithAccounts) => {
  if (!username) return null;
  try {
    const api = await apiClientConnect(auth);
    if (api == undefined) {
      console.log('API is undefined, getting no new clips');
      return null;
    }
    let request = await api.users.getUserByName(username);
    if (!request) return null;

    const user = {
      broadcasterId: request.id,
      broadcasterType: request.broadcasterType,
      creationDate: request.creationDate,
      displayName: request.displayName,
      name: request.name,
      type: request.type,
      views: request.views
    };

    return user;
  } catch (error) {
    console.log(error);
    throw Error('error');
  }
};

module.exports = {
  getClipsStartingAtCertainDateFromTwitchAPI,
  getRecentClips,
  getClipById,
  previous14Date,
  getPopularClips,
  getUserByName,
  createClip
};
