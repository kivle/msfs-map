import React, { useCallback, useEffect } from "react";
import { Map as LeafletMap, Circle } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import Marker from 'react-leaflet-enhanced-marker';

import { FaPlane } from 'react-icons/fa';
import UI from './UI';
import Wikipedia from "./layers/Wikipedia";

import { selectZoom, zoomChanged, selectCurrentMap, selectIsFollowing } from "./mapSlice";
import { getPages, selectIsEnabled, selectSearchRadius } from '../wikipedia/wikipediaSlice';

import styles from './Map.module.css';
import { MainLayer } from "./layers/MainLayer";
import { selectSimdata } from "../simdata/simdataSlice";

export default function Map() {
  const dispatch = useDispatch();
  const {
    position,
    heading
  } = useSelector(selectSimdata);
  const zoom = useSelector(selectZoom);
  const currentMap = useSelector(selectCurrentMap);
  const searchRadius = useSelector(selectSearchRadius);
  const isFollowing = useSelector(selectIsFollowing);
  const isWikipediaEnabled = useSelector(selectIsEnabled);

  useEffect(() => {
    if (isWikipediaEnabled && position?.length >= 2)
      dispatch(getPages(position[0], position[1], searchRadius));
  }, [dispatch, position, searchRadius, isWikipediaEnabled]);

  const viewportChangedHandler = useCallback((event) => {
    if (event.zoom !== zoom) {
      dispatch(zoomChanged(event.zoom));
    }
  }, [dispatch, zoom]);

  const plane = <div className={styles.plane} style={{transform: `rotate(${heading - 90}deg)`}}>
    <FaPlane size={32} stroke="white" strokeWidth="40" fill="#44F" />
  </div>;

  const mapCenter = isFollowing ? (
    position?.length >= 2 
      ? position 
      : [51.505, -0.09]
  ) : undefined;
  
  return (
    <>
      <UI />
      <LeafletMap center={mapCenter} zoom={zoom} onViewportChanged={viewportChangedHandler}>
        <MainLayer currentMap={currentMap} />
        <Wikipedia />
        {position && isWikipediaEnabled && <Circle center={position} radius={searchRadius} color="blue" fill={false} />}
        {position && <Marker position={position} icon={plane} />}
      </LeafletMap>
    </>
  );
}
