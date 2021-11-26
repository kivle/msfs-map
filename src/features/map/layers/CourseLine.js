import React from 'react';
import { Polyline } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { selectSimdata } from '../../simdata/simdataSlice';
import { selectCourseLinePoint } from '../mapSlice';

export default function CourseLine() {
  const {
    position
  } = useSelector(selectSimdata);
  const destinationPoints = useSelector(selectCourseLinePoint);

  return (
    <Polyline
      positions={[position, ...destinationPoints]}
      pathOptions={{strokeWidth: 1, color: 'gray', opacity: 0.5, }} />
  );
}
