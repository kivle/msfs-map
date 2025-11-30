import * as React from 'react';
import { Suspense } from 'react';
import { TileLayer } from 'react-leaflet';
import packageJson from '../../../../package.json';

const VectorLayer = React.lazy(() => import('./VectorLayer'));

export const MainLayer = React.memo(({ currentMap, detectRetina }) => {
  const attribution = 
    `&copy; <a target="_blank" href="https://en.wikipedia.org">Wikipedia</a>, ` +
    `${currentMap.attribution}, ` +
    `<a target="_blank" href="https://flightsim.to/file/81114/littlenavmap-msfs-poi-s">Timwintle1979's POI DB</a>, ` +
    `&copy; <a target="_blank" href="https://react-leaflet.js.org/">react-leaflet</a>, ` +
    `<a target="_blank" href="https://github.com/kivle/msfs-map">MSFS-map</a> v${packageJson.version}`;

  let mainLayer = null;

  const tileOptions = {
    detectRetina,
    ...(currentMap.tileOptions ?? {})
  };

  const hasUnknownVariant = currentMap?.tileServer?.includes?.('{variant}');

  if (currentMap.type === 'tileServer') {
    if (hasUnknownVariant) {
      console.warn('Skipping tile layer with unresolved variant', currentMap);
      return null;
    }
    mainLayer = <TileLayer
      key={`${currentMap.id ?? currentMap.name}-${currentMap.tileServer}-${detectRetina ? 'retina' : 'standard'}`}
      attribution={attribution}
      url={currentMap.tileServer}
      {...tileOptions}
    />;
  } else if (currentMap.type === 'vectorStyle') {
    mainLayer = (
      <Suspense fallback={null}>
        <VectorLayer
          key={`${currentMap.id ?? currentMap.name}-${currentMap.styleUrl}`}
          currentMap={currentMap}
          attribution={attribution}
        />
      </Suspense>
    );
  }
  
  return mainLayer;
});
