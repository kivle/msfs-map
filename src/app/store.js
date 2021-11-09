import { configureStore } from '@reduxjs/toolkit';
import mapReducer from '../features/map/mapSlice';
import simdataReducer from '../features/simdata/simdataSlice';
import wikipediaReducer from '../features/wikipedia/wikipediaSlice';

export default configureStore({
  reducer: {
    map: mapReducer,
    simdata: simdataReducer,
    wikipedia: wikipediaReducer
  }
});
