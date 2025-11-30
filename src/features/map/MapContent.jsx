import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import Wikipedia from "./layers/Wikipedia";
import { selectCourseLine, selectCurrentMap, selectDetectRetinaForCurrentMap, selectIsFollowing, selectVisualizeSearchRadius, setCurrentMap } from "./mapSlice";
import { selectIsEnabled } from '../wikipedia/wikipediaSelectors';
import { MainLayer } from "./layers/MainLayer";
import { selectSimdata } from "../simdata/simdataSlice";
import PointLayers from "./layers/PointLayers";
import CourseLine from "./layers/CourseLine";
import SearchRadiusCircle from "./layers/SearchRadiusCircle";
import Plane from "./layers/Plane";
import { useShortcutMappingsEffect } from "./shortcutHooks";
import { MapViewPersistence } from "./components/MapViewPersistence";

export default function MapContent() {
  const map = useMap();
  const dispatch = useDispatch();

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
