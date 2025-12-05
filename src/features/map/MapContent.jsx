import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from 'leaflet';
import { useSelector } from "react-redux";
import Wikipedia from "./layers/Wikipedia";
import { selectCourseLine, selectCurrentMap, selectDetectRetinaForCurrentMap, selectIsFollowing, selectVisualizeSearchRadius } from "./mapSlice";
import { selectIsEnabled } from '../wikipedia/wikipediaSelectors';
import { MainLayer } from "./layers/MainLayer";
import { selectSimdata } from "../simdata/simdataSlice";
import PointLayers from "./layers/PointLayers";
import CourseLine from "./layers/CourseLine";
import SearchRadiusCircle from "./layers/SearchRadiusCircle";
import Plane from "./layers/Plane";
import { useShortcutMappingsEffect } from "./shortcutHooks";
import { MapViewPersistence } from "./components/MapViewPersistence";

function DistanceScaleControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return undefined;
    const maxWidth = 120;

    const getRoundNum = (num) => {
      const pow10 = 10 ** (`${Math.floor(num)}`.length - 1);
      let d = num / pow10;
      if (d >= 10) d = 10;
      else if (d >= 5) d = 5;
      else if (d >= 3) d = 3;
      else if (d >= 2) d = 2;
      else d = 1;
      return pow10 * d;
    };

    const container = L.DomUtil.create('div', 'leaflet-control custom-scale');
    container.style.background = '#fff';
    container.style.border = '1px solid rgba(0,0,0,0.2)';
    container.style.borderRadius = '4px';
    container.style.padding = '6px 8px';
    container.style.boxShadow = '0 1px 4px rgba(0,0,0,0.35)';
    const bar = L.DomUtil.create('div', '', container);
    bar.style.height = '6px';
    bar.style.background = '#0d6efd';
    bar.style.borderRadius = '3px';
    bar.style.marginBottom = '4px';
    const label = L.DomUtil.create('div', '', container);
    label.style.fontSize = '12px';
    label.style.color = '#222';

    L.DomEvent.disableClickPropagation(container);

    const control = L.control({ position: 'bottomleft' });
    control.onAdd = () => container;
    control.addTo(map);

    const update = () => {
      const y = map.getSize().y / 2;
      const left = map.containerPointToLatLng([0, y]);
      const right = map.containerPointToLatLng([maxWidth, y]);
      const maxMeters = map.distance(left, right);
      if (!Number.isFinite(maxMeters) || maxMeters <= 0) return;
      const meters = getRoundNum(maxMeters);
      const kmText = meters >= 1000
        ? `${(meters / 1000).toFixed(meters >= 10000 ? 0 : 1)} km`
        : `${Math.round(meters)} m`;
      const nmValue = meters / 1852;
      const nmText = nmValue >= 10
        ? `${nmValue.toFixed(0)} nm`
        : nmValue >= 1
          ? `${nmValue.toFixed(1)} nm`
          : `${nmValue.toFixed(2)} nm`;
      const width = Math.max(20, Math.min(maxWidth, (meters / maxMeters) * maxWidth));
      bar.style.width = `${width}px`;
      label.textContent = `${kmText} / ${nmText}`;
    };

    update();
    map.on('move zoom resize', update);

    return () => {
      map.off('move zoom resize', update);
      control.remove();
    };
  }, [map]);

  return null;
}

export default function MapContent() {
  const map = useMap();

  useShortcutMappingsEffect();

  const {
    position
  } = useSelector(selectSimdata);
  const currentMap = useSelector(selectCurrentMap);
  const detectRetina = useSelector(selectDetectRetinaForCurrentMap);
  const isFollowing = useSelector(selectIsFollowing);
  const isWikipediaEnabled = useSelector(selectIsEnabled);
  const visualizeSearchRadius = useSelector(selectVisualizeSearchRadius);
  const courseLineEnabled = useSelector(selectCourseLine);

  useEffect(() => {
    if (isFollowing && position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [map, isFollowing, position]);

  // Recalculate map layout when sidebar (Wikipedia panel) is shown/hidden or on resize.
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const raf = requestAnimationFrame(invalidate);
    window.addEventListener('resize', invalidate);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', invalidate);
    };
  }, [map, isWikipediaEnabled]);

  return (
    <>
      <MapViewPersistence />
      <MainLayer currentMap={currentMap} detectRetina={detectRetina} />
      <DistanceScaleControl />
      <PointLayers />
      {!!isWikipediaEnabled && 
        <Wikipedia />
      }
      {!!position && !!isWikipediaEnabled && !!visualizeSearchRadius && 
        <SearchRadiusCircle />
      }
      {!!position && !!courseLineEnabled && 
        <CourseLine />
      }
      {!!position && 
        <Plane />
      }
    </>
  );
}
