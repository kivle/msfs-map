import React, { useEffect } from "react";
import { Circle, useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import Marker from 'react-leaflet-enhanced-marker';

import { FaPlane } from 'react-icons/fa';
import Wikipedia from "./layers/Wikipedia";

import { selectCurrentMap, selectIsFollowing, selectVisualizeSearchRadius } from "./mapSlice";
import { selectIsEnabled, selectSearchCenterPoint, selectSearchRadius } from '../wikipedia/wikipediaSlice';

import styles from './MapContent.module.css';
import { MainLayer } from "./layers/MainLayer";
import { selectSimdata } from "../simdata/simdataSlice";

export default function MapContent() {
  const map = useMap();

  const {
    position,
    heading
  } = useSelector(selectSimdata);
  const currentMap = useSelector(selectCurrentMap);
  const searchRadius = useSelector(selectSearchRadius);
  const searchCenterPoint = useSelector(selectSearchCenterPoint);
  const searchCenterPointArray = searchCenterPoint ? [
    searchCenterPoint.latitude ?? 0, 
    searchCenterPoint.longitude ?? 0
  ] : undefined;
  const isFollowing = useSelector(selectIsFollowing);
  const isWikipediaEnabled = useSelector(selectIsEnabled);
  const visualizeSearchRadius = useSelector(selectVisualizeSearchRadius);

  useEffect(() => {
    if (isFollowing && position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [map, isFollowing, position]);

  useEffect(() => {
    map.invalidateSize();
  }, [map, isWikipediaEnabled]);

  const plane = <div className={styles.plane} style={{transform: `rotate(${heading - 90}deg)`}}>
    <FaPlane size={32} stroke="white" strokeWidth="40" fill="#44F" />
  </div>;
  
  return (
    <>
      <MainLayer currentMap={currentMap} />
      {isWikipediaEnabled && 
        <Wikipedia />
      }
      {position && isWikipediaEnabled && visualizeSearchRadius && 
        <Circle center={searchCenterPointArray} radius={searchRadius} color="blue" fill={false} />
      }
      {position && 
        <Marker position={position} icon={plane} />
      }
    </>
  );
}
