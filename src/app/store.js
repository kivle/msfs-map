import { configureStore } from '@reduxjs/toolkit';
import mapReducer from '../features/map/mapSlice';
import wikipediaReducer from '../features/wikipedia/wikipediaSlice';

export default configureStore({
  reducer: {
    map: mapReducer,
    wikipedia: wikipediaReducer,
  },
});
