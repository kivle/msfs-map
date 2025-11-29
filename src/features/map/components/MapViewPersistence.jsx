import { useCallback } from "react";
import { useMapEvents } from "react-leaflet";
import localforage from "localforage";

export function MapViewPersistence() {
  const persistView = useCallback((map) => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const payload = {
      center: [center.lat, center.lng],
      zoom
    };
    localforage.setItem('mapView', payload).catch(() => {});
  }, []);

  useMapEvents({
    moveend: (e) => persistView(e.target),
    zoomend: (e) => persistView(e.target)
  });

  return null;
}
