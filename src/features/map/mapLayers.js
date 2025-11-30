export const mapLayerDefinitions = [
  {
    id: 'coreAirports',
    label: 'Core Airports',
    fileName: 'airports.geojson',
    color: '#0d6efd'
  },
  {
    id: 'corePois',
    label: 'Core POIs',
    fileName: 'pois.geojson',
    color: '#2b9348'
  },
  {
    id: 'worldUpdates',
    label: 'World Updates',
    fileName: 'world_updates.geojson',
    color: '#ff9100'
  },
  {
    id: 'cityUpdates',
    label: 'City Updates',
    fileName: 'city_updates.geojson',
    color: '#8e5ad6'
  },
  {
    id: 'photogammetry',
    label: 'Photogammetry',
    fileName: 'photogammetry.geojson',
    color: '#ff4560'
  }
];

export const defaultMapLayerVisibility = mapLayerDefinitions.reduce((acc, layer) => {
  acc[layer.id] = true;
  return acc;
}, {});
