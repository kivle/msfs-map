import { createSlice } from '@reduxjs/toolkit';

import repository from './repository';
import wikipediaEditions from './wikipediaEditions';
import { createSelector } from 'reselect';
import { computeDestinationPoint, getDistance, getRhumbLineBearing } from 'geolib';
import { angleDiff, arrayToGeolibPoint, wikipediaPointToGeolibPoint } from '../../utils/geo';
import { popup } from 'leaflet';

export const wikipediaSlice = createSlice({
  name: 'wikipedia',
  initialState: {
    edition: 'en',
    isEnabled: true,
    availableEditions: wikipediaEditions,
    pages: [],
    calculatedData: {},
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
        state.calculatedData = {};
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
      pageids.forEach(p => {
        if (Object.hasOwnProperty.call(state.calculatedData, p)) {
          delete state.calculatedData[p];
        }
      });
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
      if (Object.hasOwnProperty.call(state.calculatedData, pageid)) {
        delete state.calculatedData[pageid];
      }
    },
    markAsRead: (state, action) => {
      const { pageid } = action.payload;
      state.pages = state.pages.filter(p => p.pageid !== pageid);
      state.pagesViewed.push(pageid);
      if (Object.hasOwnProperty.call(state.calculatedData, pageid)) {
        delete state.calculatedData[pageid];
      }
    },
    setEdition: (state, action) => {
      const edition = action.payload;
      state.edition = edition;
      state.pages = [];
      state.calculatedData = {};
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
    },
    updateCalculatedData: (state, action) => {
      const { position, heading, currentTime } = action.payload;

      const pos = arrayToGeolibPoint(position);

      state.pages.forEach(p => {
        const data = state.calculatedData[p.pageid];
        const { closestPoint, lastUpdateTime } = data ?? {};
        const shouldCalculate = 
          !data ||
          !closestPoint.distance ||
          (closestPoint.distance < 5000 && closestPoint.distance > 0) ||
          (closestPoint.distance < 10000 && (lastUpdateTime + 2000) > currentTime) ||
          ((lastUpdateTime + 4000) < currentTime);
        
        if (shouldCalculate) {
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
              isInFront: headingDifference >= -45 && headingDifference <= 45
            };
          }).sort((a, b) => a.distance - b.distance)[0];

          if (closestPoint) {
            state.calculatedData[p.pageid] = {
              ...state.calculatedData[p.pageid],
              closestPoint,
              lastUpdateTime: currentTime
            };
          }
        }
      });
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
  setAutoPlay,
  updateCalculatedData
} = wikipediaSlice.actions;

function pageSort(a, b) {
  let res = a?.closestPoint && b?.closestPoint ? a.closestPoint.distance - b.closestPoint.distance : 0;
  if (res === 0) {
    res = a.page.title.localeCompare(b.page.title);
  }
  if (res === 0) {
    res = a.page.pageid - b.page.pageid;
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
  const playQueue = selectPlayQueue(state)?.map(pq => pq.page?.pageid);
  const pagesToRemove = pages.length > 80
    ? pages.filter(
        (p, i) => i >= maxPagesInState && !playQueue?.includes(p.page?.pageid)
    )
    : pages.filter(
        p => !p?.closestPoint?.isInFront && 
              p?.closestPoint?.distance > 40000 &&
             !playQueue?.includes(p.page.pageid)
    );
  dispatch(removePages({ pageids: pagesToRemove.map(p => p.page?.pageid) }));
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
    pages: state.wikipedia?.pages,
    calculatedData: state.wikipedia?.calculatedData,
    playQueue: state.wikipedia?.playQueue
  }),
  ({ pages, playQueue, calculatedData }) => {
    const pagesWithClosestPoints = pages?.map(p => {
      const { closestPoint } = calculatedData[p.pageid] ?? {};

      return {
        page: p,
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
    return playQueue.map(pageid => pages.find(p => p.page.pageid === pageid));
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
