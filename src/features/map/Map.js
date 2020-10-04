import React, { useCallback, useEffect } from "react";
import { Map as LeafletMap, TileLayer } from "react-leaflet";
import { useSelector, useDispatch } from "react-redux";
import Marker from 'react-leaflet-enhanced-marker';

import { FaPlane } from 'react-icons/fa';
import UI from './UI';
import Wikipedia from "./layers/Wikipedia";

import { selectPlanePosition, selectPlaneInfo, selectZoom, connect, zoomChanged } from "./mapSlice";

export default function Map() {
  const dispatch = useDispatch();
  const planePosition = useSelector(selectPlanePosition);
  const { heading } = useSelector(selectPlaneInfo);
  const zoom = useSelector(selectZoom);

  useEffect(() => {
    dispatch(connect);
  }, [dispatch]);

  const viewportChangedHandler = useCallback((event) => {
    if (event.zoom !== zoom) {
      dispatch(zoomChanged(event.zoom))
    }
  }, [dispatch, zoom]);

  const plane = <div style={{transform: `rotate(${heading - 90}deg)`}}>
    <FaPlane size={24} />
  </div>;

  return (
    <>
      <UI />
      <LeafletMap center={planePosition} zoom={zoom} onViewportChanged={viewportChangedHandler}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Wikipedia />
        <Marker position={planePosition} icon={plane} />
      </LeafletMap>
    </>
  );
}
