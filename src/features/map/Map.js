import React from "react";
import { MapContainer as LeafletMapContainer } from "react-leaflet";
import UI from './UI';
import MapContent from "./MapContent";
import styles from './Map.module.css';

export default function Map() {
  return (
    <div className={styles.map}>
      <UI />
      <LeafletMapContainer center={[51.505, -0.09]} zoom={13}>
        <MapContent />
      </LeafletMapContainer>
    </div>
  );
}
