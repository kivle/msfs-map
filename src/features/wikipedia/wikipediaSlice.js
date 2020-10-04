import { createSlice } from '@reduxjs/toolkit';

import { throttle } from '../../utils/throttle';
import repository from './repository';

export const wikipediaSlice = createSlice({
  name: 'wikipedia',
  initialState: {
    edition: 'en',
    pages: []
  },
  reducers: {
    pages: (state, action) => {
      const { data: { query: { pages } = [] } = {} } = action.payload;
      const geosearch = Object.keys(pages).reduce((a, p) => {
        a.push(pages[p]);
        return a;
      }, []);
      const pagesToAdd = geosearch.filter(p => !state.pages.some(p2 => p.pageid === p2.pageid));
      state.pages.push(...pagesToAdd);
    },
    setEdition: (state, action) => {
      const edition = action.payload;
      state.edition = edition;
    }
  },
});

export const {
  pages: addArticles,
  setEdition
} = wikipediaSlice.actions;

export const getArticles = (lat, lng, radius, limit = 100) => async (dispatch, getState) => {
  const state = getState();
  const edition = selectEdition(state);
  const data = await repository.getPagesByGeoLocation(edition, lat, lng, radius, limit);
  dispatch(addArticles({ data }));
};

export const selectEdition = (state) => state.wikipedia.edition;

export const selectPages = (state) => state.wikipedia.pages;

export default wikipediaSlice.reducer;
