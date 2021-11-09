import React from "react";
import { MapContainer as LeafletMapContainer } from "react-leaflet";
import UI from './UI';
import MapContent from "./MapContent";

export default function Map() {
  return (
    <>
      <UI />
      <LeafletMapContainer center={[51.505, -0.09]} zoom={13}>
        <MapContent />
      </LeafletMapContainer>
    </>
  );
}
