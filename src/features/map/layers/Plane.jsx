import React from 'react';
import { FaPlane } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { selectSimdata } from '../../simdata/simdataSlice';
import styles from './Plane.module.css';
import { Marker } from 'react-leaflet';
import { useLeafletIcon } from './hooks';

export default function Plane() {
  const {
    position,
    heading
  } = useSelector(selectSimdata);

  const plane = <div className={styles.plane} style={{transform: `rotate(${heading - 90}deg)`}}>
    <FaPlane size={32} stroke="white" strokeWidth="40" fill="#44F" />
  </div>;

  const leafletIcon = useLeafletIcon(plane);

  return (
    <Marker position={position} icon={leafletIcon} />
  );
}
