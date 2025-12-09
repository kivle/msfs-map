import React, { useEffect, useState } from "react";
import { MapContainer as LeafletMapContainer } from "react-leaflet";
import { useSelector } from "react-redux";
import UI from './UI';
import MapContent from "./MapContent";
import styles from './Map.module.css';
import localforage from "localforage";
import 'maplibre-gl/dist/maplibre-gl.css';
import { selectCurrentMap } from "./mapSlice";
import AttributionDialog from "./components/AttributionDialog";
import packageJson from "../../../package.json";

const defaultView = {
  center: [51.505, -0.09],
  zoom: 13
};

export default function Map() {
  const [initialView, setInitialView] = useState(defaultView);
  const [showAttribution, setShowAttribution] = useState(false);
  const currentMap = useSelector(selectCurrentMap);

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
        attributionControl={false}
      >
        <MapContent />
      </LeafletMapContainer>
      <div className={styles.footer}>
        <span>Map credits</span>
        <button
          type="button"
          className={styles.moreLink}
          onClick={() => setShowAttribution(true)}
        >
          more
        </button>
      </div>
      {showAttribution && (
        <AttributionDialog
          version={packageJson.version}
          mapAttribution={currentMap?.attribution}
          onClose={() => setShowAttribution(false)}
        />
      )}
    </div>
  );
}
