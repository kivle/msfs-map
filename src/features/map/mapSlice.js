import { createSlice } from '@reduxjs/toolkit';
import connectMsfs from './msfs/connection';

export const mapSlice = createSlice({
  name: 'map',
  initialState: {
    plane: {
      position: undefined,
      altitude: 0,
      heading: 0,
      airspeed: 0,
      vertical_speed: 0,
      airspeed_true: 0,
      flaps: 0,
      trim: 0,
      rudder_trim: 0
    },
    zoom: 13
  },
  reducers: {
    updateMsfs: (state, action) => {
      const { msg } = action.payload;
      state.plane.position = [msg.latitude, msg.longitude];
      state.plane.altitude = msg.altitude;
      state.plane.heading = msg.heading;
      state.plane.airspeed = msg.airspeed;
      state.plane.vertical_speed = msg.vertical_speed;
      state.plane.airspeed_true = msg.airspeed_true;
      state.plane.flaps = msg.flaps;
      state.plane.trim = msg.trim;
      state.plane.rudder_trim = msg.rudder_trim;
    },
    zoomChanged: (state, action) => {
      state.zoom = action.payload;
    }
  },
});

export const {
  updateMsfs,
  zoomChanged
} = mapSlice.actions;

export const connect = dispatch => {
  connectMsfs(msg => {
    dispatch(updateMsfs({ msg }));
  });
}

export const selectPlanePosition = state => state.map.plane.position;

export const selectZoom = state => state.map.zoom;

export const selectPlaneInfo = state => ({
  altitude: state.map.plane.altitude,
  heading: state.map.plane.heading,
  airspeed: state.map.plane.airspeed,
  vertical_speed: state.map.plane.vertical_speed,
  airspeed_true: state.map.plane.airspeed_true,
  flaps: state.map.plane.flaps,
  trim: state.map.plane.trim,
  rudder_trim: state.map.plane.rudder_trim
});

export default mapSlice.reducer;
