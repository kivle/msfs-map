import React from 'react';

import { Map as LeafletMap, TileLayer } from 'react-leaflet';

export default function Map() {

  return (
    <LeafletMap center={[51.505, -0.09]} zoom={13}>
        <TileLayer 
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
    </LeafletMap>
  );
}
