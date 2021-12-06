import React, { useMemo } from 'react';
import { ImArrowUp } from 'react-icons/im';
import { formatDistance } from '../../../utils/geo';
import styles from './DistanceVisualizer.module.css';

export default function DistanceVisualizer({
  point
}) {
  const {
    distance, headingDifference
  } = point ?? {};

  const style = useMemo(() => ({
    transform: `perspective(64px) rotate3d(1, 0, 0, 55deg) rotate(${headingDifference ?? 0}deg)`
  }), [headingDifference]);

  const formattedDistance = useMemo(
    () => formatDistance(distance), 
    [distance]
  );
  
  return point ? (
    <div className={styles.distance}>
      <ImArrowUp
        className={styles.arrow}
        size={32}
        fill={point?.isInFront ? "#2F2" : "#AAA"}
        stroke="black"
        strokeWidth={1}
        style={style}
      />
      <span>{formattedDistance}</span>
    </div>
  ) : null;
}
