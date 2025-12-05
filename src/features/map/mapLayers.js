export const mapLayerDefinitions = [
  {
    id: 'coreAirports',
    label: 'Core Airports',
    fileName: 'airports/manifest.json',
    minZoom: 6,
    clusterBelowZoom: 10,
    clusterMinPoints: 2,
    dense: true,
    useCanvas: true,
    tiled: true,
    color: '#0d6efd'
  },
  {
    id: 'corePois',
    label: 'Core POIs',
    fileName: 'pois/manifest.json',
    minZoom: 6,
    clusterBelowZoom: 10,
    clusterMinPoints: 2,
    dense: true,
    useCanvas: true,
    tiled: true,
    color: '#2b9348'
  },
  {
    id: 'worldUpdates',
    label: 'World Updates',
    fileName: 'world_updates/manifest.json',
    minZoom: 6,
    clusterBelowZoom: 10,
    clusterMinPoints: 2,
    dense: true,
    useCanvas: true,
    tiled: true,
    color: '#ff9100'
  },
  {
    id: 'cityUpdates',
    label: 'City Updates',
    fileName: 'city_updates/manifest.json',
    minZoom: 6,
    clusterBelowZoom: 10,
    clusterMinPoints: 2,
    dense: true,
    useCanvas: true,
    tiled: true,
    color: '#8e5ad6'
  },
  {
    id: 'photogammetry',
    label: 'Photogammetry',
    fileName: 'photogammetry/manifest.json',
    minZoom: 6,
    clusterBelowZoom: 10,
    clusterMinPoints: 2,
    dense: true,
    useCanvas: true,
    tiled: true,
    color: '#ff4560'
  }
];

export const globalAirportLayerDefinition = {
  id: 'globalAirports',
  label: 'Global Airports',
  fileName: 'global_airports/manifest.json',
  minZoom: 6,
  clusterBelowZoom: 10,
  clusterMinPoints: 2,
  dense: true,
  useCanvas: true,
  tiled: true,
  color: '#0d3b8a',
  defaultVisibility: false
};

export const allPointLayerDefinitions = [
  ...mapLayerDefinitions,
  globalAirportLayerDefinition
];

export const defaultMapLayerVisibility = allPointLayerDefinitions.reduce((acc, layer) => {
  acc[layer.id] = layer.defaultVisibility ?? true;
  return acc;
}, {});

export const groupedLayerDefinitions = {
  pointLayers: mapLayerDefinitions,
  extraPointLayers: [
    globalAirportLayerDefinition
  ]
};
