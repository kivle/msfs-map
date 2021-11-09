import { createSlice } from '@reduxjs/toolkit';
import servers from './mapServers';

export const mapSlice = createSlice({
  name: 'map',
  initialState: {
    isFollowing: true,
    zoom: 13,
    currentMap: 'OpenStreetMap',
    availableMaps: servers
  },
  reducers: {
    zoomChanged: (state, action) => {
      state.zoom = action.payload;
    },
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
  zoomChanged,
  setCurrentMap,
  setIsFollowing
} = mapSlice.actions;

export const selectZoom = state => state.map.zoom;

export const selectCurrentMap = state => state.map.availableMaps.find(m => m.name === state.map.currentMap);

export const selectAvailableMaps = state => state.map.availableMaps;

export const selectIsFollowing = state => state.map.isFollowing;

export default mapSlice.reducer;
