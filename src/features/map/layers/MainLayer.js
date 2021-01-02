import * as React from 'react';
import { TileLayer } from 'react-leaflet';

import { version } from '../../../../package.json';

export const MainLayer = React.memo(({ currentMap }) => {
  const attribution = 
    `&copy; <a target="_blank" href="https://en.wikipedia.org">Wikipedia</a>, ` +
    `${currentMap.attribution}, ` +
    `&copy; <a target="_blank" href="https://react-leaflet.js.org/">react-leaflet</a>, ` +
    `<a target="_blank" href="https://github.com/kivle/msfs-map">MSFS-map</a> v${version}`;

  let mainLayer = null;

  if (currentMap.type === 'tileServer') {
    mainLayer = <TileLayer
      attribution={attribution}
      url={currentMap.tileServer}
      subdomains={currentMap?.subdomains}
    />;
  }
  
  return mainLayer;
});
