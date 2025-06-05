import repository from './repository';
import {
  receivePages,
  removePages,
  updateCalculatedData,
  updateLastSearch,
  wikipediaSlice,
} from './wikipediaSlice';
import {
  selectEdition,
  selectPagesWithDistances,
  selectPlayingPage,
} from './wikipediaSelectors';
import { selectSimdata } from '../simdata/simdataSlice';
import {
  selectAutoPlay,
  selectIsPlaying,
  toggleIsPlaying,
} from '../tts/ttsSlice';

export const getPages = (lat, lng, radius) => async (dispatch, getState) => {
  dispatch(updateLastSearch({
    searchTime: new Date().getTime(),
    searchPosition: [lat, lng],
    searchRadius: radius,
  }));
  let state = getState();
  const edition = selectEdition(state);
  const data = await repository.getPagesByGeoLocation(edition, lat, lng, radius);
  if (data) {
    dispatch(
      receivePages({
        data,
        searchPosition: [lat, lng],
        searchRadius: radius,
        searchTime: new Date().getTime(),
      })
    );
    state = getState();
    const { position, heading } = selectSimdata(state);
    dispatch(
      updateCalculatedData({
        position,
        heading,
        currentTime: new Date().getTime(),
      })
    );
    const playingPage = selectPlayingPage(state);
    if (!playingPage) {
      dispatch(playNext());
    }
  }
};

export const clearPagesOutOfRange = () => (dispatch, getState) => {
  const maxPagesInState = 100;
  const maxDistanceBehindPlayerBeforePageIsRemoved = 40000;

  const state = getState();
  const pages = selectPagesWithDistances(state);
  const pagesToRemove = pages.filter((p, i) => {
    if (i >= maxPagesInState && state.wikipedia.playingPageid !== p.page?.pageid) {
      return true;
    }
    return (
      !p?.closestPoint?.isInFront &&
      p?.closestPoint?.distance > maxDistanceBehindPlayerBeforePageIsRemoved
    );
  });
  dispatch(removePages({ pageids: pagesToRemove.map((p) => p.page?.pageid) }));
};

export const playNext = () => (dispatch, getState) => {
  const state = getState();
  const autoPlay = selectAutoPlay(state);
  const isPlaying = selectIsPlaying(state);
  if (!autoPlay && isPlaying) {
    dispatch(toggleIsPlaying());
  }
  const allPages = selectPagesWithDistances(state).filter(
    (p) => p.page.pageid !== state.wikipedia.playingPageid
  );
  dispatch(
    // internal reducer action from slice
    wikipediaSlice.actions.playNext({
      nextPageid: allPages[0]?.page?.pageid,
    })
  );
};
