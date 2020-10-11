import React, { useCallback, useEffect } from "react";
import { Map as LeafletMap } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import Marker from 'react-leaflet-enhanced-marker';

import { FaPlane } from 'react-icons/fa';
import UI from './UI';
import Wikipedia from "./layers/Wikipedia";

import { selectPlanePosition, selectPlaneInfo, selectZoom, connect, zoomChanged, selectCurrentMap } from "./mapSlice";
import { getPages, selectSearchRadius } from '../wikipedia/wikipediaSlice';

import styles from './Map.module.css';
import { MainLayer } from "./layers/MainLayer";
import { CircleMarker } from "leaflet";

export default function Map() {
  const dispatch = useDispatch();
  const planePosition = useSelector(selectPlanePosition);
  const { heading } = useSelector(selectPlaneInfo);
  const zoom = useSelector(selectZoom);
  const currentMap = useSelector(selectCurrentMap);
  const searchRadius = useSelector(selectSearchRadius);

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

  const plane = <div style={{transform: `rotate(${heading - 90}deg)`}}>
    <FaPlane size={24} />
  </div>;

  const mapCenter = 
    planePosition?.length >= 2 
      ? planePosition 
      : [51.505, -0.09];
  
  return (
    <>
      <UI />
      <LeafletMap center={mapCenter} zoom={zoom} onViewportChanged={viewportChangedHandler}>
        <MainLayer currentMap={currentMap} />
        <Wikipedia />
        {planePosition && <CircleMarker center={planePosition} radius={searchRadius} />}
        {planePosition && <Marker position={planePosition} icon={plane} className={styles.plane} />}
      </LeafletMap>
    </>
  );
}
