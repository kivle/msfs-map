export default [
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
];
