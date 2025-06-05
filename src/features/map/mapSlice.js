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
    courseLine: false,
    shortcutMappings: []
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
    },
    setShortcutMappings: (state, action) => {
      state.shortcutMappings = action.payload;
    }
  },
});

export const {
  updateMsfs,
  setCurrentMap,
  setIsFollowing,
  setVisualizeSearchRadius,
  setShowCourseLine,
  setShortcutMappings
} = mapSlice.actions;

export const selectCurrentMap = state => state.map.availableMaps.find(m => m.name === state.map.currentMap);

export const selectAvailableMaps = state => state.map.availableMaps;

export const selectIsFollowing = state => state.map.isFollowing;

export const selectVisualizeSearchRadius = state => state.map.visualizeSearchRadius;

export const selectCourseLine = state => state.map.courseLine;

export const selectShortcutMappings = state => state.map.shortcutMappings;

const courseLinePointInterval = 500;
const courseLineLength = 10000;
const courseLinePoints = [];
for (let i = courseLinePointInterval; i <= courseLineLength; i += courseLinePointInterval) {
  courseLinePoints.push(i);
}

function calculatePoints(position, heading) {
  const pos = arrayToGeolibPoint(position);
  return courseLinePoints
          .map(d => computeDestinationPoint(pos, d * 1000, heading))
          .map(geolibToArrayPoint)
          .filter(p => p);
}

const selectSimdataPosition = state => selectSimdata(state)?.position;
const selectSimdataHeading = state => selectSimdata(state)?.heading;

export const selectCourseLinePoint = createSelector(
  [selectSimdataPosition, selectSimdataHeading],
  (position, heading) => {
    return position ? [position, ...calculatePoints(position, heading)] : undefined;
  }
);

export default mapSlice.reducer;
