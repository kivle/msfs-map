import React, { useCallback, useEffect } from "react";
import { Map as LeafletMap, Circle } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import Marker from 'react-leaflet-enhanced-marker';

import { FaPlane } from 'react-icons/fa';
import UI from './UI';
import Wikipedia from "./layers/Wikipedia";

import { selectPlanePosition, selectPlaneInfo, selectZoom, connect, zoomChanged, selectCurrentMap, selectIsFollowing } from "./mapSlice";
import { getPages, selectSearchRadius } from '../wikipedia/wikipediaSlice';

import styles from './Map.module.css';
import { MainLayer } from "./layers/MainLayer";

export default function Map() {
  const dispatch = useDispatch();
  const planePosition = useSelector(selectPlanePosition);
  const { heading } = useSelector(selectPlaneInfo);
  const zoom = useSelector(selectZoom);
  const currentMap = useSelector(selectCurrentMap);
  const searchRadius = useSelector(selectSearchRadius);
  const isFollowing = useSelector(selectIsFollowing);

  useEffect(() => {
    dispatch(connect);
  }, [dispatch]);

  useEffect(() => {
    if (planePosition?.length >= 2)
      dispatch(getPages(planePosition[0], planePosition[1], searchRadius));
  }, [dispatch, planePosition, searchRadius]);

  const viewportChangedHandler = useCallback((event) => {
    if (event.zoom !== zoom) {
      dispatch(zoomChanged(event.zoom));
    }
  }, [dispatch, zoom]);

  const plane = <div className={styles.plane} style={{transform: `rotate(${heading - 90}deg)`}}>
    <FaPlane size={32} stroke="white" strokeWidth="40" fill="#44F" />
  </div>;

  const mapCenter = isFollowing ? (
    planePosition?.length >= 2 
      ? planePosition 
      : [51.505, -0.09]
  ) : undefined;
  
  return (
    <>
      <UI />
      <LeafletMap center={mapCenter} zoom={zoom} onViewportChanged={viewportChangedHandler}>
        <MainLayer currentMap={currentMap} />
        <Wikipedia />
        {planePosition && <Circle center={planePosition} radius={searchRadius} color="blue" fill={false} />}
        {planePosition && <Marker position={planePosition} icon={plane} />}
      </LeafletMap>
    </>
  );
}
