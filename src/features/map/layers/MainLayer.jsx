import * as React from 'react';
import { TileLayer } from 'react-leaflet';

import packageJson from '../../../../package.json';

export const MainLayer = React.memo(({ currentMap }) => {
  const attribution = 
    `&copy; <a target="_blank" href="https://en.wikipedia.org">Wikipedia</a>, ` +
    `${currentMap.attribution}, ` +
    `&copy; <a target="_blank" href="https://react-leaflet.js.org/">react-leaflet</a>, ` +
    `<a target="_blank" href="https://github.com/kivle/msfs-map">MSFS-map</a> v${packageJson.version}`;

  let mainLayer = null;

  const subdomains = currentMap.subdomains
    ? { subdomains: currentMap.subdomains }
    : {};

  if (currentMap.type === 'tileServer') {
    mainLayer = <TileLayer
      key={currentMap.tileServer}
      attribution={attribution}
      url={currentMap.tileServer}
      {...subdomains}
    />;
  }
  
  return mainLayer;
});
