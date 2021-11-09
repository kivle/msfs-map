import { createSlice } from '@reduxjs/toolkit';

export const mapSlice = createSlice({
  name: 'map',
  initialState: {
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
