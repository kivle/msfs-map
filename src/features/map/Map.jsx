import React, { useEffect, useState } from "react";
import { MapContainer as LeafletMapContainer } from "react-leaflet";
import UI from './UI';
import MapContent from "./MapContent";
import styles from './Map.module.css';
import localforage from "localforage";

const defaultView = {
  center: [51.505, -0.09],
  zoom: 13
};

export default function Map() {
  const [initialView, setInitialView] = useState(defaultView);

  useEffect(() => {
    let cancelled = false;
    async function loadView() {
      try {
        const saved = await localforage.getItem('mapView');
        if (!cancelled && saved?.center && saved?.zoom !== undefined) {
          setInitialView({
            center: saved.center,
            zoom: saved.zoom
          });
        }
      } catch {
        // ignore preference load errors
      }
    }
    loadView();
    return () => { cancelled = true; };
  }, []);

  const mapKey = `map-${initialView.center.join(',')}-${initialView.zoom}`;

  return (
    <div className={styles.map}>
      <UI />
      <LeafletMapContainer
        key={mapKey}
        center={initialView.center}
        zoom={initialView.zoom}
        zoomSnap={1}
        zoomDelta={1}
      >
        <MapContent />
      </LeafletMapContainer>
    </div>
  );
}
