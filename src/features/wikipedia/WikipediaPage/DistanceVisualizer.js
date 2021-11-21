import React from 'react';
import { ImArrowUp } from 'react-icons/im';
import { formatDistance } from '../../../utils/geo';
import styles from './DistanceVisualizer.module.css';

export default function DistanceVisualizer({
  page
}) {
  const {
    distance, headingDifference
  } = page?.closestPoint ?? {};
  
  return (
    <div className={styles.distance}>
      <ImArrowUp
        className={styles.arrow}
        size={32}
        fill="#AAA"
        stroke="black"
        strokeWidth={1}
        style={{
          transform: `perspective(64px) rotate3d(1, 0, 0, 55deg) rotate(${headingDifference ?? 0}deg)`
        }}
      />
      <span>{formatDistance(distance)}</span>
    </div>
  );
}
