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
    zoom: 13,
    tileServer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    availableTileServers: [
      { name: 'OpenStreetMap', tileServer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
      // { name: 'OpenAIP', tileServer: 'http://{s}.tile.maps.openaip.net/geowebcache/service/tms/1.0.0/openaip_basemap@EPSG%3A900913@png/{z}/{x}/{y}.png' },
      { name: 'Stamen toner', tileServer: 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png' },
      { name: 'Stamen terrain', tileServer: 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png' },
      { name: 'Stamen watercolor', tileServer: 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png' },
      { name: 'Carto Dark', tileServer: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png' }
    ]
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
    },
    setTileServer: (state, action) => {
      state.tileServer = action.payload;
    }
  },
});

export const {
  updateMsfs,
  zoomChanged,
  setTileServer
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

export const selectTileServer = state => state.map.tileServer;

export const selectAvailableTileServers = state => state.map.availableTileServers;

export default mapSlice.reducer;
