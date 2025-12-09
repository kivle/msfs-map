import * as React from 'react';
import { Suspense } from 'react';
import { TileLayer } from 'react-leaflet';

const VectorLayer = React.lazy(() => import('./VectorLayer'));

export const MainLayer = React.memo(({ currentMap, detectRetina }) => {
  const attribution = 'Map credits';

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
