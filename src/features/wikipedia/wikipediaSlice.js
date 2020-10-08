import { createSlice } from '@reduxjs/toolkit';

import repository from './repository';

function worthwhile(text) {
  if (!text) return false;
  
  // try to determine if an extract is even worth reading
  return text.length > 100 && (text.match(/\./g) || []).length > 1;
}

export const wikipediaSlice = createSlice({
  name: 'wikipedia',
  initialState: {
    edition: 'en',
    currentPage: undefined,
    pages: [],
    pagesViewed: []
  },
  reducers: {
    addPages: (state, action) => {
      const { data: { query: { pages } = {} } = {} } = action.payload;
      if (!pages) return;
      const geosearch = Object.keys(pages).reduce((a, p) => {
        a.push(pages[p]);
        return a;
      }, []);
      const pagesToAdd = geosearch.filter(
        p => p?.extract?.length > 100 &&
             worthwhile(p?.extract) &&
             p?.coordinates?.length > 0 &&
             !state.pages.some(p2 => p.pageid === p2.pageid) &&
             !state.pagesViewed.some(p2 => p.pageid === p2)
      );
      state.pages.push(...pagesToAdd);
      if (pagesToAdd.length && state.currentPage === undefined) {
        state.currentPage = pagesToAdd[0].pageid;
      }
    },
    nextPage: (state) => {
      if (state.currentPage !== undefined) {
        state.pages = state.pages.filter(p => p.pageid !== state.currentPage);
        state.pagesViewed.push(state.currentPage);
        while (state.pages.length > 10) {
          // Remove least worthwhile articles to not end up with a huge backlog
          const shortestArticle = Math.min(...state.pages.map(p => p.extract.length));
          const leastInteresting = state.pages.find(p => p.extract.length === shortestArticle);
          state.pages = state.pages.filter(p => p.pageid !== leastInteresting.pageid);
        }
      }
      const unreadPage = state.pages
        .sort(
          (a, b) => b?.extract?.length - a?.extract?.length
        ).find(
          p => !state.pagesViewed.some(v => p.pageid === v)
        );
      if (unreadPage) {
        state.currentPage = unreadPage.pageid;
      }
      else {
        state.currentPage = undefined;
      }
    },
    setEdition: (state, action) => {
      const edition = action.payload;
      state.edition = edition;
    }
  },
});

export const {
  addPages,
  nextPage,
  setEdition
} = wikipediaSlice.actions;

export const getPages = (lat, lng, radius) => async (dispatch, getState) => {
  const state = getState();
  const edition = selectEdition(state);
  const data = await repository.getPagesByGeoLocation(edition, lat, lng, radius);
  if (data)
    dispatch(addPages({ data }));
};

export const selectEdition = (state) => state.wikipedia.edition;

export const selectPages = (state) => state.wikipedia.pages;

export const selectCurrentPage = (state) => 
  state.wikipedia.currentPage && state.wikipedia.pages.find(p => p.pageid === state.wikipedia.currentPage);

export default wikipediaSlice.reducer;
