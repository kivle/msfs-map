import React, { useMemo } from 'react';
import { ImArrowUp } from 'react-icons/im';
import { formatDistance } from '../../../utils/geo';
import styles from './DistanceVisualizer.module.css';

export default function DistanceVisualizer({
  page
}) {
  const {
    distance, headingDifference
  } = page?.closestPoint ?? {};

  const style = useMemo(() => ({
    transform: `perspective(64px) rotate3d(1, 0, 0, 55deg) rotate(${headingDifference ?? 0}deg)`
  }), [headingDifference]);

  const formattedDistance = useMemo(
    () => formatDistance(distance), 
    [distance]
  );
  
  return (
    <div className={styles.distance}>
      <ImArrowUp
        className={styles.arrow}
        size={32}
        fill="#AAA"
        stroke="black"
        strokeWidth={1}
        style={style}
      />
      <span>{formattedDistance}</span>
    </div>
  );
}
