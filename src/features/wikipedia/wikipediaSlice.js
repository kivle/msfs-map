import { createSlice } from '@reduxjs/toolkit';

import repository from './repository';
import wikipediaEditions from './wikipediaEditions';
import { createSelector } from 'reselect';
import { computeDestinationPoint, getDistance, getRhumbLineBearing } from 'geolib';
import { angleDiff, arrayToGeolibPoint, wikipediaPointToGeolibPoint } from '../../utils/geo';
import { selectSimdata } from '../simdata/simdataSlice';
import { selectAutoPlay, selectIsPlaying, toggleIsPlaying } from '../tts/ttsSlice';

export const wikipediaSlice = createSlice({
  name: 'wikipedia',
  initialState: {
    edition: 'en',
    isEnabled: true,
    availableEditions: wikipediaEditions,
    pages: [],
    calculatedData: {},
    pagesViewed: [],
    playingPageid: undefined,
    lastSearchPosition: undefined,
    lastSearchRadius: undefined,
    lastSearchTime: undefined,
    searchRadius: 10000
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
        state.playingPageid = undefined;
        state.lastSearchPosition = undefined;
        state.lastSearchRadius = undefined;
        state.lastSearchTime = undefined;
      }
    },
    updateLastSearch: (state, action) => {
      const {
        searchPosition, searchRadius, searchTime 
      } = action.payload;
      state.lastSearchPosition = searchPosition;
      state.lastSearchRadius = searchRadius;
      state.lastSearchTime = searchTime;
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
      state.playingPageid = pageids.includes(state.playingPageid) ? undefined : state.playingPageid;
      pageids.forEach(p => {
        if (Object.hasOwnProperty.call(state.calculatedData, p)) {
          delete state.calculatedData[p];
        }
      });
    },
    playNext: (state, action) => {
      const { nextPageid } = action.payload;
      const pageid = state.playingPageid;
      if (pageid) {
        state.pages = state.pages.filter(p => p.pageid !== pageid);
        state.pagesViewed.push(pageid);
      }
      state.playingPageid = nextPageid;
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
      state.playingPageid = undefined;
      state.lastSearchPosition = undefined;
      state.lastSearchRadius = undefined;
      state.lastSearchTime = undefined;
    },
    setSearchRadius: (state, action) => {
      state.searchRadius = parseInt(action.payload, 10);
    },
    updateCalculatedData: (state, action) => {
      const { position, heading, currentTime } = action.payload;

      const pos = arrayToGeolibPoint(position);

      state.pages.forEach(p => {
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

        if (closestPoint) {
          state.calculatedData[p.pageid] = {
            ...state.calculatedData[p.pageid],
            closestPoint,
            lastUpdateTime: currentTime
          };
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
  markAsRead,
  setSearchRadius,
  updatePageRatings,
  updateCalculatedData,
  updateLastSearch
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
  dispatch(updateLastSearch({
    searchTime: new Date().getTime(),
    searchPosition: [lat, lng],
    searchRadius: radius
  }));
  let state = getState();
  const edition = selectEdition(state);
  const data = await repository.getPagesByGeoLocation(edition, lat, lng, radius);
  if (data) {
    dispatch(receivePages({
      data, 
      searchPosition: [lat, lng],
      searchRadius: radius,
      searchTime: new Date().getTime()
    }));
    state = getState();
    const {
      position,
      heading
    } = selectSimdata(state);
    dispatch(updateCalculatedData({ position, heading, currentTime: new Date().getTime() }));
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
    return !p?.closestPoint?.isInFront && 
            p?.closestPoint?.distance > maxDistanceBehindPlayerBeforePageIsRemoved;
  });
  dispatch(removePages({ pageids: pagesToRemove.map(p => p.page?.pageid) }));
};

export const playNext = () => (dispatch, getState) => {
  const state = getState();
  const autoPlay = selectAutoPlay(state);
  const isPlaying = selectIsPlaying(state);
  if (!autoPlay && isPlaying) {
    dispatch(toggleIsPlaying());
  }
  const allPages = selectPagesWithDistances(state).filter(p => p.page.pageid !== state.wikipedia.playingPageid);
  dispatch(wikipediaSlice.actions.playNext({ nextPageid: allPages[0]?.page?.pageid }));
};

export const selectIsEnabled = (state) => state.wikipedia.isEnabled;

export const selectEdition = (state) => state.wikipedia.edition;

export const selectAvailableEditions = (state) => state.wikipedia.availableEditions;

export const selectPages = (state) => state.wikipedia.pages;

export const selectSearchRadius = (state) => state.wikipedia.searchRadius;

export const selectLastSearchPosition = (state) => state.wikipedia.lastSearchPosition;

export const selectLastSearchRadius = (state) => state.wikipedia.lastSearchRadius;

export const selectLastSearchTime = (state) => state.wikipedia.lastSearchTime;

export const selectPagesWithDistances = createSelector(
  (state) => ({
    pages: state.wikipedia?.pages,
    calculatedData: state.wikipedia?.calculatedData,
    playingPageid: state.wikipedia?.playingPageid
  }),
  ({ pages, playingPageid, calculatedData }) => {
    const pagesWithClosestPoints = pages?.map(p => {
      const { closestPoint } = calculatedData[p.pageid] ?? {};

      return {
        page: p,
        closestPoint,
        isReading: playingPageid === p.pageid
      };
    }).sort(pageSort);
    
    return [
      ...pagesWithClosestPoints.filter(p => p.closestPoint?.isInFront),
      ...pagesWithClosestPoints.filter(p => !p.closestPoint?.isInFront),
    ];
  }
);

export const selectPlayingPage = createSelector(
  (state) =>  ({
    pages: selectPagesWithDistances(state),
    playingPageid: state.wikipedia?.playingPageid
  }),
  ({ pages, playingPageid }) => {
    return pages.find(p => p.page.pageid === playingPageid);
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
