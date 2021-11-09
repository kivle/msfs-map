import { createSlice } from '@reduxjs/toolkit';
import servers from './mapServers';

export const mapSlice = createSlice({
  name: 'map',
  initialState: {
    isFollowing: true,
    currentMap: 'OpenStreetMap',
    availableMaps: servers
  },
  reducers: {
    setCurrentMap: (state, action) => {
      state.currentMap = action.payload;
    },
    setIsFollowing: (state, action) => {
      state.isFollowing = action.payload;
    }
  },
});

export const {
  updateMsfs,
  setCurrentMap,
  setIsFollowing
} = mapSlice.actions;

export const selectCurrentMap = state => state.map.availableMaps.find(m => m.name === state.map.currentMap);

export const selectAvailableMaps = state => state.map.availableMaps;

export const selectIsFollowing = state => state.map.isFollowing;

export default mapSlice.reducer;
