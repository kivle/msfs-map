import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import Wikipedia from "./layers/Wikipedia";
import { selectCourseLine, selectCurrentMap, selectIsFollowing, selectVisualizeSearchRadius } from "./mapSlice";
import { selectIsEnabled } from '../wikipedia/wikipediaSlice';
import { MainLayer } from "./layers/MainLayer";
import { selectSimdata } from "../simdata/simdataSlice";
import CourseLine from "./layers/CourseLine";
import SearchRadiusCircle from "./layers/SearchRadiusCircle";
import Plane from "./layers/Plane";

export default function MapContent() {
  const map = useMap();

  const {
    position
  } = useSelector(selectSimdata);
  const currentMap = useSelector(selectCurrentMap);
  const isFollowing = useSelector(selectIsFollowing);
  const isWikipediaEnabled = useSelector(selectIsEnabled);
  const visualizeSearchRadius = useSelector(selectVisualizeSearchRadius);
  const courseLineEnabled = useSelector(selectCourseLine);

  useEffect(() => {
    if (isFollowing && position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [map, isFollowing, position]);

  useEffect(() => {
    map.invalidateSize();
  }, [map, isWikipediaEnabled]);

  return (
    <>
      <MainLayer currentMap={currentMap} />
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
