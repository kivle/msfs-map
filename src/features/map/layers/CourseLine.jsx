import React from 'react';
import { Polyline } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { selectCourseLinePoint } from '../mapSlice';

export default function CourseLine() {
  const destinationPoints = useSelector(selectCourseLinePoint);

  return destinationPoints ? (
    <Polyline
      positions={destinationPoints}
      pathOptions={{ color: 'gray', opacity: 0.5 }} />
  ) : null;
}
