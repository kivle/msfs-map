import { createSlice } from '@reduxjs/toolkit';
import striptags from 'striptags';
import { decode } from 'entities';

import repository from './repository';
import ML from '../../utils/ml';
import wikipediaEditions from './wikipediaEditions';

export const wikipediaSlice = createSlice({
  name: 'wikipedia',
  initialState: {
    edition: 'en',
    isEnabled: true,
    availableEditions: wikipediaEditions,
    currentVoice: undefined,
    availableVoices: [],
    currentPageid: undefined,
    pages: [],
    pagesViewed: [],
    lastSearchPosition: undefined,
    lastSearchRadius: undefined,
    lastSearchTime: undefined,
    searchRadius: 10000,
    isPlaying: false
  },
  reducers: {
    setEnabled: (state, action) => {
      if (action.payload) {
        state.isEnabled = true;
      }
      else {
        state.isEnabled = false;
        state.isPlaying = false;
        state.currentPageid = undefined;
        state.pages = [];
      }
    },
    addPages: (state, action) => {
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
             !state.pagesViewed.some(p2 => p.pageid === p2)
      );
      state.pages.push(...pagesToAdd);
      if (pagesToAdd.length && state.currentPageid === undefined) {
        state.currentPageid = pagesToAdd[0].pageid;
      }
      state.lastSearchPosition = searchPosition;
      state.lastSearchRadius = searchRadius;
      state.lastSearchTime = searchTime;
    },
    nextPage: (state) => {
      // Remove current page from backlog
      if (state.currentPageid !== undefined) {
        state.pages = state.pages.filter(p => p.pageid !== state.currentPageid);
        state.pagesViewed.push(state.currentPageid);
      }

      // Limit backlog if there are a lot of pages loaded
      while (state.pages.length > 30) {
        // Remove least worthwhile articles to not end up with a huge backlog
        if (state.pages.some(p => p.rating === 'bad')) {
          const badPages = state.pages.filter(p => p.rating === 'bad');
          const shortestArticle = Math.min(
            ...badPages.map(p => p.extract.length)
          );
          const leastInteresting = badPages.find(p => p.extract.length === shortestArticle);
          state.pages = state.pages.filter(p => p.pageid !== leastInteresting.pageid);
        }
        else {
          const shortestArticle = Math.min(...state.pages.map(p => p.extract.length));
          const leastInteresting = state.pages.find(p => p.extract.length === shortestArticle);
          state.pages = state.pages.filter(p => p.pageid !== leastInteresting.pageid);
        }
      }

      // Find best candidate as next page
      const unreadGoodPage = state.pages
        .filter(
          p => p.rating === 'good'
        )
        .sort(
          (a, b) => b?.extract?.length - a?.extract?.length
        ).find(
          p => !state.pagesViewed.some(v => p.pageid === v)
        );
      if (unreadGoodPage) {
        state.currentPageid = unreadGoodPage.pageid;
      }
      else if (state.pages.length) {
        state.currentPageid = state.pages[0].pageid;
      }
      else {
        state.currentPageid = undefined;
      }
    },
    setEdition: (state, action) => {
      const edition = action.payload;
      state.edition = edition;
      state.currentPageid = undefined;
      state.pages = [];
      state.pagesViewed = [];
      state.lastSearchPosition = undefined;
      state.lastSearchRadius = undefined;
      state.lastSearchTime = undefined;
    },
    setVoice: (state, action) => {
      const voice = action.payload;
      state.currentVoice = voice;
    },
    setAvailableVoices: (state, action) => {
      const voices = action.payload;
      state.availableVoices = voices;
      if (state.voice && !state.availableVoices.some(v => v === state.voice))
        state.voice = undefined;
    },
    setSearchRadius: (state, action) => {
      state.searchRadius = parseInt(action.payload, 10);
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    updatePageRatings: (state, action) => {
      action.payload.forEach(element => {
        const page = state.pages.find(p => p.pageid === element.pageid);
        page.rating = element.rating;
        page.userRated = !!element.userRated;
      });
    }
  },
});

export const {
  setEnabled,
  addPages,
  nextPage,
  setVoice,
  setAvailableVoices,
  setSearchRadius,
  setIsPlaying,
  updatePageRatings
} = wikipediaSlice.actions;

export const setEdition = (edition) => async (dispatch, getState) => {
  dispatch(wikipediaSlice.actions.setEdition(edition));
  ML.setLanguage(edition);
};

export const getPages = (lat, lng, radius) => async (dispatch, getState) => {
  const state = getState();
  const edition = selectEdition(state);
  const data = await repository.getPagesByGeoLocation(edition, lat, lng, radius);
  if (data) {
    dispatch(addPages({
      data, 
      searchPosition: [lat, lng],
      searchRadius: radius,
      searchTime: new Date().getTime()
    }));
    dispatch(classifyPages());
  }
};

export const classifyPages = (force = false) => async (dispatch, getState) => {
  const state = getState();
  const pages = selectPages(state);
  const pagesToClassify = pages.filter(p => force || !p.rating);
  const results = await Promise.all(pagesToClassify.map(async p => {
    const text = decode(striptags(p.extract));
    const rating = await ML.classify(text);
    return {
      pageid: p.pageid,
      rating
    };
  }));
  dispatch(updatePageRatings(results));
};

export const ratePage = (pageid, rating) => async (dispatch, getState) => {
  const state = getState();
  const pages = selectPages(state);
  const page = pages.find(p => p.pageid === pageid);
  if (!page) {
    return;
  }
  const text = decode(striptags(page.extract));
  ML.add(text, rating);
  const updatedRating = await ML.classify(text);
  dispatch(updatePageRatings([{ userRated: true, rating: updatedRating, pageid }]));
  const updatedState = getState();
  const currentPage = selectCurrentPage(updatedState);
  if (currentPage.pageid === pageid && rating === 'bad') {
    dispatch(nextPage());
  }
  dispatch(classifyPages(true));
};

export const selectIsEnabled = (state) => state.wikipedia.isEnabled;

export const selectEdition = (state) => state.wikipedia.edition;

export const selectAvailableEditions = (state) => state.wikipedia.availableEditions;

export const selectVoice = (state) => state.wikipedia.currentVoice;

export const selectAvailableVoices = (state) => state.wikipedia.availableVoices;

export const selectPages = (state) => state.wikipedia.pages;

export const selectCurrentPage = (state) => 
  state.wikipedia.currentPageid && state.wikipedia.pages.find(p => p.pageid === state.wikipedia.currentPageid);

export const selectSearchRadius = (state) => state.wikipedia.searchRadius;

export const selectIsPlaying = (state) => state.wikipedia.isPlaying;

export const selectLastSearchPosition = (state) => state.wikipedia.lastSearchPosition;

export const selectLastSearchRadius = (state) => state.wikipedia.lastSearchRadius;

export const selectLastSearchTime = (state) => state.wikipedia.lastSearchTime;

export default wikipediaSlice.reducer;
