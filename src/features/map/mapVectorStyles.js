const stadiaAttribution = '&copy; <a target="_blank" href="https://www.stadiamaps.com/">Stadia Maps</a> &copy; <a target="_blank" href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';

const vectorMaps = [
  {
    id: 'vector-stadia-alidade-smooth',
    name: 'vector: Stadia Alidade Smooth',
    type: 'vectorStyle',
    renderType: 'vector',
    styleUrl: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json',
    attribution: stadiaAttribution
  },
  {
    id: 'vector-stadia-outdoors',
    name: 'vector: Stadia Outdoors',
    type: 'vectorStyle',
    renderType: 'vector',
    styleUrl: 'https://tiles.stadiamaps.com/styles/outdoors.json',
    attribution: stadiaAttribution
  },
  {
    id: 'vector-stadia-osm-bright',
    name: 'vector: Stadia OSM Bright',
    type: 'vectorStyle',
    renderType: 'vector',
    styleUrl: 'https://tiles.stadiamaps.com/styles/osm_bright.json',
    attribution: stadiaAttribution
  }
];

export default vectorMaps;
