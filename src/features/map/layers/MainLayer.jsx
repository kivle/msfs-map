import * as React from 'react';
import { TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import maplibregl from 'maplibre-gl';
import '@maplibre/maplibre-gl-leaflet';

// Patch maplibre-gl-leaflet methods to guard against _map being null during teardown
const patchMaplibrePrototype = () => {
  const proto = L.MaplibreGL?.prototype;
  if (!proto || proto.__patchedForNullMap) return;
  const guard = (fn) => function guarded(...args) {
    if (!this?._map) return;
    return fn.apply(this, args);
  };
  ['_transitionEnd', '_resize', '_update', '_animateZoom', '_zoomStart', '_zoomEnd', '_pinchZoom', 'onRemove'].forEach((name) => {
    if (typeof proto[name] === 'function') {
      proto[name] = guard(proto[name]);
    }
  });
  proto.__patchedForNullMap = true;
};
patchMaplibrePrototype();

import packageJson from '../../../../package.json';

const VectorLayer = ({ currentMap, attribution }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!currentMap?.styleUrl || !L.maplibreGL) return;
    const layer = L.maplibreGL({
      style: currentMap.styleUrl,
      attribution,
      maplibregl
    });
    layer.addTo(map);

    const glMap = layer.getMaplibreMap?.();
    let onStyleImageMissing;
    if (glMap) {
      onStyleImageMissing = (e) => {
        if (glMap.hasImage(e.id)) return;
        // Provide a 1x1 transparent placeholder to avoid console noise for missing sprites
        const empty = new Uint8Array(4);
        try {
          glMap.addImage(e.id, { width: 1, height: 1, data: empty }, { pixelRatio: 1, sdf: false });
        } catch {
          // ignore if maplibre rejects duplicate or invalid ids
        }
      };
      glMap.on('styleimagemissing', onStyleImageMissing);
    }

    return () => {
      try {
        map.removeLayer(layer);
        layer._glMap?.remove?.();
        if (glMap && onStyleImageMissing) {
          glMap.off('styleimagemissing', onStyleImageMissing);
        }
      } catch {}
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
