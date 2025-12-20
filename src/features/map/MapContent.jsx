import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import Wikipedia from "./layers/Wikipedia";
import { selectCourseLine, selectCurrentMap, selectDetectRetinaForCurrentMap, selectIsFollowing, selectMapLayerVisibility } from "./mapSlice";
import { selectMarchingSpeedKnots } from "./mapSlice";
import { selectIsEnabled } from '../wikipedia/wikipediaSelectors';
import { setEnabled } from "../wikipedia/wikipediaSlice";
import { MainLayer } from "./layers/MainLayer";
import { selectSimdata } from "../simdata/simdataSlice";
import PointLayers from "./layers/PointLayers";
import CourseLine from "./layers/CourseLine";
import Plane from "./layers/Plane";
import { useShortcutMappingsEffect } from "./shortcutHooks";
import { MapViewPersistence } from "./components/MapViewPersistence";
import DistanceScaleControl from "./components/DistanceScaleControl";

export default function MapContent() {
  const map = useMap();
  const dispatch = useDispatch();
  const marchingSpeedKnots = useSelector(selectMarchingSpeedKnots);

  useShortcutMappingsEffect();

  const {
    position
  } = useSelector(selectSimdata);
  const currentMap = useSelector(selectCurrentMap);
  const detectRetina = useSelector(selectDetectRetinaForCurrentMap);
  const isFollowing = useSelector(selectIsFollowing);
  const isWikipediaEnabled = useSelector(selectIsEnabled);
  const mapLayerVisibility = useSelector(selectMapLayerVisibility);
  const isWikipediaLayerEnabled = !!mapLayerVisibility?.wikipedia;
  const courseLineEnabled = useSelector(selectCourseLine);

  useEffect(() => {
    if (isFollowing && position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [map, isFollowing, position]);

  useEffect(() => {
    if (isWikipediaEnabled !== isWikipediaLayerEnabled) {
      dispatch(setEnabled(isWikipediaLayerEnabled));
    }
  }, [dispatch, isWikipediaEnabled, isWikipediaLayerEnabled]);

  // Recalculate map layout when sidebar (Wikipedia panel) is shown/hidden or on resize.
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const raf = requestAnimationFrame(invalidate);
    window.addEventListener('resize', invalidate);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', invalidate);
    };
  }, [map, isWikipediaLayerEnabled]);

  return (
    <>
      <MapViewPersistence />
      <MainLayer currentMap={currentMap} detectRetina={detectRetina} />
      <DistanceScaleControl marchingSpeedKnots={marchingSpeedKnots} />
      <PointLayers />
      {!!isWikipediaLayerEnabled && 
        <Wikipedia />
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
