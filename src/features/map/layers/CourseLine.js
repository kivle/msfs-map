import React from 'react';
import { Polyline } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { selectCourseLinePoint } from '../mapSlice';

export default function CourseLine() {
  const destinationPoints = useSelector(selectCourseLinePoint);

  return (
    <Polyline
      positions={destinationPoints}
      pathOptions={{strokeWidth: 1, color: 'gray', opacity: 0.5, }} />
  );
}
