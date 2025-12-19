import { createSlice } from '@reduxjs/toolkit';

import wikipediaEditions from './wikipediaEditions';

export const wikipediaSlice = createSlice({
  name: 'wikipedia',
  initialState: {
    edition: 'en',
    isEnabled: false,
    availableEditions: wikipediaEditions,
    pages: [],
    pagesViewed: [],
    pageDetails: {},
    loadingPageDetails: {},
    selectedPageId: undefined,
    lastSearchBounds: undefined,
    searchRadius: 10000,
    needsMoreZoom: false
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
        state.pageDetails = {};
        state.loadingPageDetails = {};
        state.selectedPageId = undefined;
        state.lastSearchBounds = undefined;
        state.needsMoreZoom = false;
      }
    },
    receivePages: (state, action) => {
      const { pages, bounds } = action.payload ?? {};
      const filtered = (pages ?? []).filter(
        (p) => p?.pageid &&
          !state.pagesViewed.some((p2) => p2 === p.pageid)
      );
      state.pages = filtered;
      state.lastSearchBounds = bounds;
      state.needsMoreZoom = false;
      if (state.selectedPageId && !filtered.some((p) => p.pageid === state.selectedPageId)) {
        state.selectedPageId = undefined;
      }
    },
    removePages: (state, action) => {
      const { pageids } = action.payload ?? {};
      state.pages = state.pages.filter(p => !pageids.includes(p.pageid));
      pageids?.forEach(p => {
        if (Object.hasOwnProperty.call(state.pageDetails, p)) {
          delete state.pageDetails[p];
        }
      });
      if (pageids?.includes(state.selectedPageId)) {
        state.selectedPageId = undefined;
      }
    },
    setEdition: (state, action) => {
      const edition = action.payload;
      state.edition = edition;
      state.pages = [];
      state.pagesViewed = [];
      state.pageDetails = {};
      state.loadingPageDetails = {};
      state.selectedPageId = undefined;
      state.lastSearchBounds = undefined;
      state.needsMoreZoom = false;
    },
    setSearchRadius: (state, action) => {
      state.searchRadius = parseInt(action.payload, 10);
    },
    setSelectedPageId: (state, action) => {
      state.selectedPageId = action.payload;
    },
    setLastSearchBounds: (state, action) => {
      state.lastSearchBounds = action.payload;
    },
    startLoadingPageDetail: (state, action) => {
      const pageid = action.payload;
      state.loadingPageDetails = {
        ...(state.loadingPageDetails ?? {}),
        [pageid]: true
      };
    },
    receivePageDetails: (state, action) => {
      const { pages, pageids } = action.payload ?? {};
      const receivedPages = Object.values(pages ?? {});
      receivedPages.forEach((page) => {
        const existing = state.pageDetails[page.pageid] ?? {};
        if ((!page.pageimages || page.pageimages.length === 0) && existing.pageimages?.length) {
          page.pageimages = existing.pageimages;
        }
        if (!page.thumbnail && existing.thumbnail) {
          page.thumbnail = existing.thumbnail;
        }
        state.pageDetails[page.pageid] = page;
      });
      (pageids ?? receivedPages.map((p) => p.pageid)).forEach((id) => {
        if (state.loadingPageDetails?.[id]) {
          delete state.loadingPageDetails[id];
        }
      });
    },
    setNeedsMoreZoom: (state, action) => {
      state.needsMoreZoom = !!action.payload;
    }
  }
});

export const {
  setEnabled,
  setEdition,
  receivePages,
  removePages,
  setSearchRadius,
  setSelectedPageId,
  setLastSearchBounds,
  startLoadingPageDetail,
  receivePageDetails,
  setNeedsMoreZoom
} = wikipediaSlice.actions;

export default wikipediaSlice.reducer;
