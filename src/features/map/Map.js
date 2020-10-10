import React, { useCallback, useEffect } from "react";
import { Map as LeafletMap, TileLayer } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import Marker from 'react-leaflet-enhanced-marker';

import { FaPlane } from 'react-icons/fa';
import UI from './UI';
import Wikipedia from "./layers/Wikipedia";

import { selectPlanePosition, selectPlaneInfo, selectZoom, connect, zoomChanged } from "./mapSlice";
import { getPages } from '../wikipedia/wikipediaSlice';

import { version } from '../../../package.json';

import styles from './Map.module.css';

export default function Map() {
  const dispatch = useDispatch();
  const planePosition = useSelector(selectPlanePosition);
  const { heading } = useSelector(selectPlaneInfo);
  const zoom = useSelector(selectZoom);

  useEffect(() => {
    dispatch(connect);
  }, [dispatch]);

  useEffect(() => {
    if (planePosition?.length >= 2)
      dispatch(getPages(planePosition[0], planePosition[1], 10000));
  }, [dispatch, planePosition]);

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
        <TileLayer
          attribution={
            `&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors, ` +
            `&copy; <a target="_blank" href="https://en.wikipedia.org">Wikipedia</a>, ` +
            `&copy; <a target="_blank" href="https://react-leaflet.js.org/">react-leaflet</a>, ` +
            `<a target="_blank" href="https://github.com/kivle/msfs-map">MSFS-map</a> v${version}`}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Wikipedia />
        {planePosition && <Marker position={planePosition} icon={plane} className={styles.plane} />}
      </LeafletMap>
    </>
  );
}
