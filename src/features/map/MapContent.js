import React, { useEffect } from "react";
import { Circle, useMap } from "react-leaflet";
import { useSelector } from "react-redux";
import Marker from 'react-leaflet-enhanced-marker';

import { FaPlane } from 'react-icons/fa';
import Wikipedia from "./layers/Wikipedia";

import { selectCurrentMap, selectIsFollowing } from "./mapSlice";
import { selectIsEnabled, selectSearchRadius } from '../wikipedia/wikipediaSlice';

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
  const isFollowing = useSelector(selectIsFollowing);
  const isWikipediaEnabled = useSelector(selectIsEnabled);

  useEffect(() => {
    if (isFollowing && position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [map, isFollowing, position]);

  const plane = <div className={styles.plane} style={{transform: `rotate(${heading - 90}deg)`}}>
    <FaPlane size={32} stroke="white" strokeWidth="40" fill="#44F" />
  </div>;
  
  return (
    <>
      <MainLayer currentMap={currentMap} />
      {isWikipediaEnabled && <Wikipedia />}
      {position && isWikipediaEnabled && <Circle center={position} radius={searchRadius} color="blue" fill={false} />}
      {position && <Marker position={position} icon={plane} />}
    </>
  );
}