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
  ground_heading,
  ground_course,
  ground_speed,
  connected,
  position
}) =>
  <div className={styles.main}>
    {!connected && `Disconnected from simulator. Start vfrmap.exe.`}
    {connected && <>
      <InfoField 
        label="Airspeed" 
        value={`${airspeed} kt (${airspeed_true} kt)`}
      />
      {Number.isFinite(ground_speed) && <InfoField 
        label="Gnd speed" 
        value={`${ground_speed} kt`}
      />}
      <InfoField 
        label="Altitude" 
        value={`${altitude} ft`}
      />
      <InfoField 
        label="Heading" 
        value={<><FaPlane style={{transform: `rotate(${heading - 90}deg)`}} />{` ${heading}°`}</>}
      />
      {Number.isFinite(ground_heading) && <InfoField 
        label="Ground heading" 
        value={`${ground_heading}°`}
      />}
      {Number.isFinite(ground_course) && <InfoField 
        label="Ground course" 
        value={`${ground_course}°`}
      />}
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
      {position !== undefined && position.length >= 2 && <InfoField
        label="Position"
        value={
          <a 
            title="Open position in Google Maps" 
            target="_blank" 
            href={`https://www.google.com/maps/search/?api=1&query=${parseFloat(position[0]).toFixed(6)},${parseFloat(position[1]).toFixed(6)}`}>
            {parseFloat(position[0]).toFixed(4)} {parseFloat(position[1]).toFixed(4)}
          </a>
        }
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
