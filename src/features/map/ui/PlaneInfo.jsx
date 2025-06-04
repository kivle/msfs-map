import * as React from 'react';

import { useSelector } from "react-redux";

import { FaPlane } from 'react-icons/fa';
import styles from './PlaneInfo.module.css';
import { selectSimdata } from '../../simdata/simdataSlice';

const PlaneInfoPanel = React.memo(({
  airspeed,
  airspeed_true,
  altitude,
  heading,
  vertical_speed,
  flaps,
  trim,
  rudder_trim,
  connected
}) =>
  <div className={styles.main}>
    {!connected && `Disconnected from simulator. Start vfrmap.exe.`}
    {connected && <>
      <InfoField 
        label="Airspeed" 
        value={`${airspeed} kt (${airspeed_true} kt)`}
      />
      <InfoField 
        label="Altitude" 
        value={`${altitude} ft`}
      />
      <InfoField 
        label="Heading" 
        value={<><FaPlane style={{transform: `rotate(${heading - 90}deg)`}} />{` ${heading}°`}</>}
      />
      <InfoField 
        label="V. speed" 
        value={`${vertical_speed} ft/s`}
      />
      {parseFloat(flaps) !== 0 && <InfoField 
        label="Flaps" 
        value={`${flaps}`}
      />}
      {parseFloat(trim) !== 0 && <InfoField 
        label="Trim" 
        value={`${trim}%`}
      />}
      {parseFloat(rudder_trim) !== 0 && <InfoField 
        label="R.Trim" 
        value={`${rudder_trim}%`}
      />}
    </>}
  </div>
);

function InfoField({ label, value, unit }) {
  return (
    <span className={styles.infoField}>
      <label>{label}</label>
      <span>{value}</span>
    </span>
  )
}

export default function PlaneInfo() {
  const simdata = useSelector(selectSimdata);
  return <PlaneInfoPanel {...simdata} />;
}
