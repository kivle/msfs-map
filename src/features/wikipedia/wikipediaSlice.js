import { createSlice } from '@reduxjs/toolkit';

import wikipediaEditions from './wikipediaEditions';
import { getDistance, getRhumbLineBearing } from 'geolib';
import { angleDiff, arrayToGeolibPoint, wikipediaPointToGeolibPoint } from '../../utils/geo';

export const wikipediaSlice = createSlice({
  name: 'wikipedia',
  initialState: {
    edition: 'en',
    isEnabled: false,
    availableEditions: wikipediaEditions,
    pages: [],
    calculatedData: {},
    pagesViewed: [],
    playingPageid: undefined,
    lastSearchPosition: undefined,
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
        state.lastSearchTime = undefined;
      }
    },
    updateLastSearch: (state, action) => {
      const {
        searchPosition, searchTime 
      } = action.payload;
      state.lastSearchPosition = searchPosition;
      state.lastSearchTime = searchTime;
    },
    receivePages: (state, action) => {
      const { 
        data: { query: { pages } = {} } = {}, 
        searchPosition, searchTime 
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
  updateCalculatedData,
  updateLastSearch
} = wikipediaSlice.actions;

export default wikipediaSlice.reducer;
