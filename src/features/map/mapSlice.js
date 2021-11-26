import { createSelector } from 'reselect';
import { createSlice } from '@reduxjs/toolkit';
import { computeDestinationPoint } from 'geolib';
import servers from './mapServers';
import { selectSimdata } from '../simdata/simdataSlice';
import { arrayToGeolibPoint, geolibToArrayPoint } from '../../utils/geo';

export const mapSlice = createSlice({
  name: 'map',
  initialState: {
    isFollowing: true,
    currentMap: 'OpenStreetMap',
    availableMaps: servers,
    visualizeSearchRadius: true,
    courseLine: false
  },
  reducers: {
    setCurrentMap: (state, action) => {
      state.currentMap = action.payload;
    },
    setIsFollowing: (state, action) => {
      state.isFollowing = action.payload;
    },
    setVisualizeSearchRadius: (state, action) => {
      state.visualizeSearchRadius = action.payload;
    },
    setShowCourseLine: (state, action) => {
      state.courseLine = action.payload;
    }
  },
});

export const {
  updateMsfs,
  setCurrentMap,
  setIsFollowing,
  setVisualizeSearchRadius,
  setShowCourseLine
} = mapSlice.actions;

export const selectCurrentMap = state => state.map.availableMaps.find(m => m.name === state.map.currentMap);

export const selectAvailableMaps = state => state.map.availableMaps;

export const selectIsFollowing = state => state.map.isFollowing;

export const selectVisualizeSearchRadius = state => state.map.visualizeSearchRadius;

export const selectCourseLine = state => state.map.courseLine;

function calculatePoints(position, heading) {
  return [100, 200, 300, 400, 500]
          .map(d => computeDestinationPoint(position, d * 1000, heading))
          .map(geolibToArrayPoint);
}

export const selectCourseLinePoint = createSelector(
  state => ({
    position: selectSimdata(state)?.position,
    heading: selectSimdata(state)?.heading
  }),
  ({ position, heading }) => {
    const pos = arrayToGeolibPoint(position);
    return pos && heading ? calculatePoints(pos, heading) : undefined;
  }
);

export default mapSlice.reducer;
