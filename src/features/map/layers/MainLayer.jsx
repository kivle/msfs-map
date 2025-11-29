import * as React from 'react';
import { TileLayer } from 'react-leaflet';

import packageJson from '../../../../package.json';

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
  }
  
  return mainLayer;
});
