import { createSlice } from '@reduxjs/toolkit';

import repository from './repository';
import wikipediaEditions from './wikipediaEditions';
import { createSelector } from 'reselect';
import { computeDestinationPoint, getDistance, getRhumbLineBearing } from 'geolib';
import { angleDiff, arrayToGeolibPoint, wikipediaPointToGeolibPoint } from '../../utils/geo';

export const wikipediaSlice = createSlice({
  name: 'wikipedia',
  initialState: {
    edition: 'en',
    isEnabled: true,
    availableEditions: wikipediaEditions,
    pages: [],
    pagesViewed: [],
    playQueue: [],
    lastSearchPosition: undefined,
    lastSearchRadius: undefined,
    lastSearchTime: undefined,
    searchRadius: 10000,
    autoPlay: true,
    autoPlayDistance: 1000
  },
  reducers: {
    setEnabled: (state, action) => {
      if (action.payload) {
        state.isEnabled = true;
      }
      else {
        state.isEnabled = false;
        state.pages = [];
        state.pagesViewed = [];
        state.playQueue = [];
        state.lastSearchPosition = undefined;
        state.lastSearchRadius = undefined;
        state.lastSearchTime = undefined;
      }
    },
    receivePages: (state, action) => {
      const { 
        data: { query: { pages } = {} } = {}, 
        searchPosition, searchRadius, searchTime 
      } = action.payload;
      
      if (!pages) return;
      
      const geosearch = Object.keys(pages).reduce((a, p) => {
        a.push(pages[p]);
        return a;
      }, []);
      const pagesToAdd = geosearch.filter(
        p => !state.pages.some(p2 => p.pageid === p2.pageid) &&
             !state.pagesViewed.some(p2 => p.pageid === p2) &&
             p.coordinates
      );
      state.pages.push(...pagesToAdd);
      state.lastSearchPosition = searchPosition;
      state.lastSearchRadius = searchRadius;
      state.lastSearchTime = searchTime;
    },
    removePages: (state, action) => {
      const { pageids } = action.payload;
      state.pages = state.pages.filter(p => !pageids.includes(p.pageid));
    },
    addToPlayQueue: (state, action) => {
      const { pageid } = action.payload;
      state.playQueue.push(pageid);
    },
    advancePlayQueue: (state, action) => {
      const { nextPageId } = action.payload;
      const pageid = state.playQueue.shift();
      state.playQueue = [
        ...(nextPageId ? [nextPageId] : []),
        ...state.playQueue.filter(p => p !== nextPageId)
      ];
      state.pages = state.pages.filter(p => p.pageid !== pageid);
      state.pagesViewed.push(pageid);
    },
    markAsRead: (state, action) => {
      const { pageid } = action.payload;
      state.pages = state.pages.filter(p => p.pageid !== pageid);
      state.pagesViewed.push(pageid);
    },
    setEdition: (state, action) => {
      const edition = action.payload;
      state.edition = edition;
      state.pages = [];
      state.pagesViewed = [];
      state.playQueue = [];
      state.lastSearchPosition = undefined;
      state.lastSearchRadius = undefined;
      state.lastSearchTime = undefined;
    },
    setSearchRadius: (state, action) => {
      state.searchRadius = parseInt(action.payload, 10);
    },
    setAutoPlay: (state, { payload }) => {
      const { enabled, distance } = payload;
      if (enabled !== undefined)
        state.autoPlay = enabled;
      if (distance !== undefined)
        state.autoPlayDistance = distance;
    }
  }
});

export const {
  setEnabled,
  setEdition,
  receivePages,
  removePages,
  addToPlayQueue,
  markAsRead,
  setSearchRadius,
  updatePageRatings,
  setAutoPlay
} = wikipediaSlice.actions;

function pageSort(a, b) {
  let res = a.closestPoint.distance - b.closestPoint.distance;
  if (res === 0) {
    res = a.title.localeCompare(b.title);
  }
  if (res === 0) {
    res = a.pageid - b.pageid;
  }
  return res;
}

export const getPages = (lat, lng, radius) => async (dispatch, getState) => {
  const state = getState();
  const edition = selectEdition(state);
  const data = await repository.getPagesByGeoLocation(edition, lat, lng, radius);
  if (data) {
    dispatch(receivePages({
      data, 
      searchPosition: [lat, lng],
      searchRadius: radius,
      searchTime: new Date().getTime()
    }));
  }
};

export const clearPagesOutOfRange = () => (dispatch, getState) => {
  const maxPagesInState = 80;
  const state = getState();
  const pages = selectPagesWithDistances(state);
  const playQueue = selectPlayQueue(state)?.map(pq => pq.pageid);
  const pagesToRemove = pages.length > 80
    ? pages.filter(
        (p, i) => i >= maxPagesInState && !playQueue?.includes(p.pageid)
    )
    : pages.filter(
        p => !p.closestPoint.isInFront && 
              p.closestPoint.distance > 40000 &&
             !playQueue?.includes(p.pageid)
    );
  dispatch(removePages({ pageids: pagesToRemove.map(p => p.pageid) }));
};

export const advancePlayQueue = () => (dispatch, getState) => {
  const state = getState();
  const [, ...remaining] = selectPlayQueue(state);
  const orderedByDistance = remaining.sort(pageSort);
  dispatch(wikipediaSlice.actions.advancePlayQueue({ nextPageId: orderedByDistance[0]?.pageid }));
};

export const selectIsEnabled = (state) => state.wikipedia.isEnabled;

export const selectEdition = (state) => state.wikipedia.edition;

export const selectAvailableEditions = (state) => state.wikipedia.availableEditions;

export const selectPages = (state) => state.wikipedia.pages;

export const selectSearchRadius = (state) => state.wikipedia.searchRadius;

export const selectLastSearchPosition = (state) => state.wikipedia.lastSearchPosition;

export const selectLastSearchRadius = (state) => state.wikipedia.lastSearchRadius;

export const selectLastSearchTime = (state) => state.wikipedia.lastSearchTime;

export const selectAutoPlay = (state) => state.wikipedia.autoPlay;

export const selectAutoPlayDistance = (state) => state.wikipedia.autoPlayDistance;

export const selectPagesWithDistances = createSelector(
  (state) => ({
    position: state.simdata?.position,
    heading: state.simdata?.heading, 
    pages: state.wikipedia?.pages,
    playQueue: state.wikipedia?.playQueue
  }),
  ({ position, heading, pages, playQueue }) => {
    const pos = arrayToGeolibPoint(position);

    const pagesWithClosestPoints = pages?.map(p => {
      const closestPoint = p.coordinates?.map((coord) => {
        const coordGeolib = wikipediaPointToGeolibPoint(coord);
        const distance = pos && getDistance(pos, coordGeolib);
        const bearing = pos && Math.round(getRhumbLineBearing(pos, coordGeolib));
        const headingDifference = angleDiff(bearing ?? 0, heading ?? 0);

        return { 
          coord,
          distance,
          bearing,
          headingDifference,
          isInFront: headingDifference >= -90 && headingDifference <= 90
        };
      }).sort((a, b) => a.distance - b.distance)[0];

      return {
        ...p,
        closestPoint,
        isInPlayQueue: playQueue.includes(p.pageid),
        isReading: playQueue[0] === p.pageid
      };
    }).sort(pageSort);
    
    return [
      ...pagesWithClosestPoints.filter(p => p.closestPoint?.isInFront),
      ...pagesWithClosestPoints.filter(p => !p.closestPoint?.isInFront),
    ];
  }
);

export const selectPlayQueue = createSelector(
  (state) =>  ({
    pages: selectPagesWithDistances(state),
    playQueue: state.wikipedia?.playQueue
  }),
  ({ pages, playQueue }) => {
    return playQueue.map(pageid => pages.find(p => p.pageid === pageid));
  }
);

export const selectSearchCenterPoint = createSelector(
  (state) => ({
    position: state.simdata?.position,
    heading: state.simdata?.heading,
    speed: state.simdata?.airspeed,
    searchRadius: state.wikipedia?.searchRadius
  }),
  ({ position, heading, searchRadius, speed }) =>
    position ? (
      speed > 50 ?
      computeDestinationPoint(
        arrayToGeolibPoint(position),
        searchRadius, 
        heading
      ) : arrayToGeolibPoint(position)
    ) : undefined
);

export default wikipediaSlice.reducer;
