import * as React from 'react';
import { TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import maplibregl from 'maplibre-gl';
import '@maplibre/maplibre-gl-leaflet';

import packageJson from '../../../../package.json';

const VectorLayer = ({ currentMap, attribution }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!currentMap?.styleUrl) return;
    const layer = L.maplibreGL({
      style: currentMap.styleUrl,
      attribution,
      maplibregl
    });
    layer.addTo(map);
    return () => {
      if (layer) {
        map.removeLayer(layer);
      }
    };
  }, [map, currentMap?.styleUrl, currentMap?.id, attribution]);

  return null;
};

export const MainLayer = React.memo(({ currentMap, detectRetina }) => {
  const attribution = 
    `&copy; <a target="_blank" href="https://en.wikipedia.org">Wikipedia</a>, ` +
    `${currentMap.attribution}, ` +
    `&copy; <a target="_blank" href="https://react-leaflet.js.org/">react-leaflet</a>, ` +
    `<a target="_blank" href="https://github.com/kivle/msfs-map">MSFS-map</a> v${packageJson.version}`;

  let mainLayer = null;

  const tileOptions = {
    detectRetina,
    ...(currentMap.tileOptions ?? {})
  };

  if (currentMap.type === 'tileServer') {
    mainLayer = <TileLayer
      key={`${currentMap.id ?? currentMap.name}-${currentMap.tileServer}-${detectRetina ? 'retina' : 'standard'}`}
      attribution={attribution}
      url={currentMap.tileServer}
      {...tileOptions}
    />;
  } else if (currentMap.type === 'vectorStyle') {
    mainLayer = <VectorLayer
      key={`${currentMap.id ?? currentMap.name}-${currentMap.styleUrl}`}
      currentMap={currentMap}
      attribution={attribution}
    />;
  }
  
  return mainLayer;
});
