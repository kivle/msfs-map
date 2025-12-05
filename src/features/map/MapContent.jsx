import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from 'leaflet';
import { useSelector } from "react-redux";
import Wikipedia from "./layers/Wikipedia";
import { selectCourseLine, selectCurrentMap, selectDetectRetinaForCurrentMap, selectIsFollowing, selectVisualizeSearchRadius } from "./mapSlice";
import { selectMarchingSpeedKnots } from "./mapSlice";
import { selectIsEnabled } from '../wikipedia/wikipediaSelectors';
import { MainLayer } from "./layers/MainLayer";
import { selectSimdata } from "../simdata/simdataSlice";
import PointLayers from "./layers/PointLayers";
import CourseLine from "./layers/CourseLine";
import SearchRadiusCircle from "./layers/SearchRadiusCircle";
import Plane from "./layers/Plane";
import { useShortcutMappingsEffect } from "./shortcutHooks";
import { MapViewPersistence } from "./components/MapViewPersistence";

function formatEtaFromNm(nm, knots) {
  if (!knots || knots <= 0 || !Number.isFinite(nm) || nm <= 0) return '';
  const hours = nm / knots;
  const totalMinutes = hours * 60;
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes - h * 60);
  if (h > 0) {
    return `~${h}h ${m.toString().padStart(2, '0')}m`;
  }
  if (m > 0) return `~${m}m`;
  const seconds = Math.max(1, Math.round(totalMinutes * 60));
  return `~${seconds}s`;
}

function DistanceScaleControl({ marchingSpeedKnots }) {
  const map = useMap();
  const measuringRef = React.useRef(false);
  const [_, forceRender] = React.useState(0); // to refresh label text
  const distanceTextRef = React.useRef('');
  const polylineRef = React.useRef(null);
  const markersRef = React.useRef(null);
  const pointsRef = React.useRef([]);
  const recomputeRef = React.useRef(() => {});
  const speedRef = React.useRef(marchingSpeedKnots);

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

    const measureRow = L.DomUtil.create('div', '', container);
    measureRow.style.display = 'flex';
    measureRow.style.alignItems = 'center';
    measureRow.style.gap = '6px';
    measureRow.style.marginTop = '4px';

    const measureButton = L.DomUtil.create('button', '', measureRow);
    measureButton.textContent = measuringRef.current ? 'End measure' : 'Measure';
    measureButton.style.cursor = 'pointer';
    measureButton.style.padding = '4px 6px';
    measureButton.style.border = '1px solid #ccc';
    measureButton.style.borderRadius = '4px';
    measureButton.style.background = measuringRef.current ? '#0d6efd' : '#f8f8f8';
    measureButton.style.color = measuringRef.current ? '#fff' : '#222';
    measureButton.style.fontSize = '12px';

    const measureLabel = L.DomUtil.create('div', '', measureRow);
    measureLabel.style.fontSize = '12px';
    measureLabel.style.color = '#222';

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

    const resetMeasurement = () => {
      pointsRef.current = [];
      distanceTextRef.current = '';
      if (polylineRef.current) {
        polylineRef.current.setLatLngs([]);
      }
      if (markersRef.current) {
        markersRef.current.clearLayers();
      }
      measureLabel.textContent = '';
    };

    const computeDistanceText = () => {
      const pts = pointsRef.current;
      if (pts.length < 2) {
        distanceTextRef.current = '';
        measureLabel.textContent = measuringRef.current ? 'Click map to measure' : '';
        return;
      }
      let meters = 0;
      for (let i = 1; i < pts.length; i += 1) {
        meters += map.distance(pts[i - 1], pts[i]);
      }
      const km = meters / 1000;
      const nm = meters / 1852;
      const kmText = km >= 10 ? `${km.toFixed(0)} km` : `${km.toFixed(2)} km`;
      const nmText = nm >= 10 ? `${nm.toFixed(0)} nm` : `${nm.toFixed(2)} nm`;
      const etaText = formatEtaFromNm(nm, speedRef.current);
      distanceTextRef.current = etaText ? `${kmText} / ${nmText} (${etaText})` : `${kmText} / ${nmText}`;
      measureLabel.textContent = distanceTextRef.current;
    };
    recomputeRef.current = computeDistanceText;

    const updateMeasurementGraphics = () => {
      if (!polylineRef.current) {
        polylineRef.current = L.polyline([], { color: '#0d6efd', weight: 3 });
        polylineRef.current.addTo(map);
      }
      if (!markersRef.current) {
        markersRef.current = L.layerGroup().addTo(map);
      }
      markersRef.current.clearLayers();
      const pts = pointsRef.current;
      polylineRef.current.setLatLngs(pts);
      pts.forEach((pt) => {
        L.circleMarker(pt, {
          radius: 4,
          color: '#0d6efd',
          weight: 2,
          fillColor: '#fff',
          fillOpacity: 1
        }).addTo(markersRef.current);
      });
      computeDistanceText();
    };

    const handleMapClick = (e) => {
      if (!measuringRef.current) return;
      pointsRef.current = [...pointsRef.current, e.latlng];
      updateMeasurementGraphics();
    };

    const toggleMeasuring = () => {
      const next = !measuringRef.current;
      measuringRef.current = next;
      if (!next) {
        resetMeasurement();
        map.off('click', handleMapClick);
      } else {
        resetMeasurement();
        map.on('click', handleMapClick);
      }
      measureButton.textContent = next ? 'End measure' : 'Measure';
      measureButton.style.background = next ? '#0d6efd' : '#f8f8f8';
      measureButton.style.color = next ? '#fff' : '#222';
      if (!next) {
        distanceTextRef.current = '';
      } else {
        measureLabel.textContent = 'Click map to measure';
      }
      forceRender((v) => v + 1);
    };

    measureButton.onclick = (e) => {
      e.preventDefault();
      toggleMeasuring();
    };

    measureLabel.textContent = distanceTextRef.current || (measuringRef.current ? 'Click map to measure' : '');

    update();
    map.on('move zoom resize', update);

    return () => {
      map.off('move zoom resize', update);
      control.remove();
      map.off('click', handleMapClick);
      resetMeasurement();
    };
  }, [map]);

  useEffect(() => {
    speedRef.current = marchingSpeedKnots;
    if (measuringRef.current) {
      recomputeRef.current();
      forceRender((v) => v + 1);
    }
  }, [marchingSpeedKnots]);

  return null;
}

export default function MapContent() {
  const map = useMap();
  const marchingSpeedKnots = useSelector(selectMarchingSpeedKnots);

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
      <DistanceScaleControl marchingSpeedKnots={marchingSpeedKnots} />
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
