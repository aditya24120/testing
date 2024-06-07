import { apiClientConnect } from './apiClient';
import { TUserWithAccounts } from '../../types/types';

export type Game = {
  boxArtUrl: string;
  id: string;
  name: string;
};

export const getGamesByIds = async (ids: string[], auth?: TUserWithAccounts) => {
  if (!ids || ids.length === 0) return [];
  try {
    const api = await apiClientConnect(auth);
    if (api == undefined) {
      console.log('API is undefined, getting no new clips');
      return [];
    }
    let request = await api.games.getGamesByIds(ids);
    if (!request) return [];

    let gamesRequest: Game[] = request.flatMap((x: Game) => x);
    const games = gamesRequest.map((game) => {
      return {
        boxArtUrl: game.boxArtUrl,
        id: game.id,
        name: game.name
      };
    });

    return games;
  } catch (error) {
    console.log(error);
    throw Error('error');
  }
};
