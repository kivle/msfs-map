import repository from './repository';
import {
  receivePages,
  removePages,
  updateCalculatedData,
  updateLastSearch,
} from './wikipediaSlice';
import {
  selectEdition,
  selectPagesWithDistances
} from './wikipediaSelectors';
import { selectSimdata } from '../simdata/simdataSlice';

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
  }
};

export const clearPagesOutOfRange = () => (dispatch, getState) => {
  const maxPagesInState = 100;
  const maxDistanceBehindPlayerBeforePageIsRemoved = 40000;

  const state = getState();
  const pages = selectPagesWithDistances(state);
  const pagesToRemove = pages.filter((p, i) => {
    if (i >= maxPagesInState) {
      return true;
    }
    return (
      !p?.closestPoint?.isInFront &&
      p?.closestPoint?.distance > maxDistanceBehindPlayerBeforePageIsRemoved
    );
  });
  dispatch(removePages({ pageids: pagesToRemove.map((p) => p.page?.pageid) }));
};
