import { createSelector } from 'reselect';
import { createSlice } from '@reduxjs/toolkit';
import { computeDestinationPoint } from 'geolib';
import servers from './mapServers';
import { selectSimdata } from '../simdata/simdataSlice';
import { arrayToGeolibPoint, geolibToArrayPoint } from '../../utils/geo';
import { defaultMapLayerVisibility } from './mapLayers';

export const mapSlice = createSlice({
  name: 'map',
  initialState: {
    isFollowing: true,
    currentMap: servers[0]?.id ?? 'OpenStreetMap',
    availableMaps: servers,
    courseLine: false,
    detectRetinaByMap: {},
    shortcutMappings: [],
    mapLayers: defaultMapLayerVisibility,
    mapLayersEnabled: false,
    preferencesLoaded: false,
    marchingSpeedKnots: 120
  },
  reducers: {
    setCurrentMap: (state, action) => {
      state.currentMap = action.payload;
    },
    setIsFollowing: (state, action) => {
      state.isFollowing = action.payload;
    },
    setShowCourseLine: (state, action) => {
      state.courseLine = action.payload;
    },
    setDetectRetina: (state, action) => {
      const { mapId, enabled } = action.payload;
      if (mapId) {
        state.detectRetinaByMap = {
          ...(state.detectRetinaByMap ?? {}),
          [mapId]: enabled
        };
      }
    },
    setDetectRetinaMap: (state, action) => {
      state.detectRetinaByMap = action.payload ?? {};
    },
    setShortcutMappings: (state, action) => {
      state.shortcutMappings = action.payload;
    },
    setMapLayers: (state, action) => {
      state.mapLayers = {
        ...defaultMapLayerVisibility,
        ...(action.payload ?? {})
      };
    },
    setMapLayerEnabled: (state, action) => {
      const { layerId, enabled } = action.payload ?? {};
      if (!layerId) return;
      state.mapLayers = {
        ...defaultMapLayerVisibility,
        ...(state.mapLayers ?? {}),
        [layerId]: enabled
      };
    },
    setMapLayersEnabled: (state, action) => {
      state.mapLayersEnabled = !!action.payload;
    },
    setPreferencesLoaded: (state, action) => {
      state.preferencesLoaded = !!action.payload;
    },
    setMarchingSpeedKnots: (state, action) => {
      const value = Number(action.payload);
      state.marchingSpeedKnots = Number.isFinite(value) && value > 0 ? value : state.marchingSpeedKnots;
    }
  },
});

export const {
  setCurrentMap,
  setIsFollowing,
  setShowCourseLine,
  setDetectRetina,
  setDetectRetinaMap,
  setShortcutMappings,
  setMapLayers,
  setMapLayerEnabled,
  setMapLayersEnabled,
  setPreferencesLoaded,
  setMarchingSpeedKnots
} = mapSlice.actions;

export const selectCurrentMap = createSelector(
  [
    state => state.map.availableMaps ?? [],
    state => state.map.currentMap
  ],
  (available, currentId) => {
    const isValid = (m) => m && !m.tileServer?.includes?.('{variant}');
    const validMap = available.find((m) => m.id === currentId && isValid(m));
    return validMap ?? available.find(isValid) ?? available[0];
  }
);

export const selectAvailableMaps = state => state.map.availableMaps;

export const selectIsFollowing = state => state.map.isFollowing;

export const selectCourseLine = state => state.map.courseLine;

export const selectDetectRetinaByMap = state => state.map.detectRetinaByMap ?? {};

export const selectDetectRetinaForCurrentMap = createSelector(
  state => selectCurrentMap(state)?.id,
  selectDetectRetinaByMap,
  (mapId, detectMap) => (mapId ? detectMap[mapId] : undefined) ?? false
);

export const selectShortcutMappings = state => state.map.shortcutMappings;

const selectMapLayersState = state => state.map.mapLayers ?? {};

export const selectMapLayerVisibility = createSelector(
  selectMapLayersState,
  (layers) => ({
    ...defaultMapLayerVisibility,
    ...layers
  })
);

export const selectMapLayersEnabled = state => !!state.map.mapLayersEnabled;

export const selectPreferencesLoaded = state => !!state.map.preferencesLoaded;
export const selectMarchingSpeedKnots = state => state.map.marchingSpeedKnots ?? 120;

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

export const selectCourseLinePoint = createSelector(
  state => ({
    position: selectSimdata(state)?.position,
    heading: selectSimdata(state)?.heading
  }),
  ({ position, heading }) => {
    return position ? [position, ...calculatePoints(position, heading)] : undefined;
  }
);

export default mapSlice.reducer;
