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
    isFollowing: true,
    zoom: 13,
    currentMap: 'OpenStreetMap',
    availableMaps: [
      { 
        name: 'OpenStreetMap', 
        type: 'tileServer', 
        tileServer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', 
        attribution: `&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors` 
      },
      // { 
      //   name: 'OpenAIP', 
      //   type: 'tileServer',
      //   tileServer: 'http://{s}.tile.maps.openaip.net/geowebcache/service/tms/1.0.0/openaip_basemap@EPSG%3A900913@png/{z}/{x}/{y}.png',
      //   attribution: `&copy; <a target="_blank' href="https://www.openaip.net">openAIP</a>`
      // },
      { 
        name: 'Stamen toner', 
        type: 'tileServer', 
        tileServer: 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png',
        attribution: `&copy; <a target="_blank' href="http://maps.stamen.com">Stamen</a>`
      },
      { 
        name: 'Stamen terrain', 
        type: 'tileServer', 
        tileServer: 'http://{s}.tile.stamen.com/terrain/{z}/{x}/{y}.png',
        attribution: `&copy; <a target="_blank' href="http://maps.stamen.com">Stamen</a>`
      },
      { 
        name: 'Stamen watercolor', 
        type: 'tileServer', 
        tileServer: 'http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png',
        attribution: `&copy; <a target="_blank' href="http://maps.stamen.com">Stamen</a>`
      },
      { 
        name: 'Carto Dark', 
        type: 'tileServer', 
        tileServer: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
        attribution: `&copy; <a target="_blank' href="https://carto.com">Carto</a>`
      },
      {
        name: 'Carto (voyager)',
        type: 'tileServer',
        tileServer: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a target="_blank" href="https://osm.org/copyright">OpenStreetMap</a> <a target="_blank" href="https://carto.com/">Carto</a>',
        subdomains: 'abcd'
      },
      {
        name: 'Airspace data (OpenAIP)',
        type: 'tileServer',
        tileServer: 'https://{s}.tile.maps.openaip.net/geowebcache/service/tms/1.0.0/openaip_basemap@EPSG%3A900913@png/{z}/{x}/{y}.png',
        attribution: '"Airspace data: <a target="_blank" href="https://www.openaip.net/">OpenAIP</a>',
        subdomains: '12'
      }
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

export const selectCurrentMap = state => state.map.availableMaps.find(m => m.name === state.map.currentMap);

export const selectAvailableMaps = state => state.map.availableMaps;

export const selectIsFollowing = state => state.map.isFollowing;

export default mapSlice.reducer;
