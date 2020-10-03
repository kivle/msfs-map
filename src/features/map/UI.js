import * as React from "react";
import { useSelector } from "react-redux";
import { selectPlaneInfo } from "./mapSlice";

import { FaPlane } from 'react-icons/fa';
import styles from './UI.module.css';

export default function UI() {
  const {
    airspeed,
    airspeed_true,
    heading,
    vertical_speed,
    flaps,
    trim,
    rudder_trim
  } = useSelector(selectPlaneInfo);

  return (
    <div>
      <div className={styles.main}>
        <InfoField 
          label="Airspeed" 
          value={`${airspeed} kt (${airspeed_true} kt)`}
        />
        <InfoField 
          label="Heading" 
          value={<><FaPlane style={{transform: `rotate(${heading - 90}deg)`}} />{` ${heading}°`}</>}
        />
        <InfoField 
          label="V. speed" 
          value={`${vertical_speed} ft/s`}
        />
        {flaps !== '0' && <InfoField 
          label="Flaps" 
          value={`${flaps}`}
        />}
        <InfoField 
          label="Trim" 
          value={`${trim}%`}
        />
        <InfoField 
          label="R.Trim" 
          value={`${rudder_trim}%`}
        />
      </div>
    </div>
  );
}

function InfoField({ label, value, unit }) {
  return (
    <span className={styles.infoField}>
      <label>{label}</label>
      <span>{value}</span>
    </span>
  )
}
