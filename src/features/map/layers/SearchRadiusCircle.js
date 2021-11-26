import React from 'react';
import { Circle } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { geolibToArrayPoint } from '../../../utils/geo';
import { selectSearchCenterPoint, selectSearchRadius } from '../../wikipedia/wikipediaSlice';

export default function SearchRadiusCircle() {
  const searchRadius = useSelector(selectSearchRadius);
  const searchCenterPoint = useSelector(selectSearchCenterPoint);
  const searchCenterPointArray = geolibToArrayPoint(searchCenterPoint);
  
  return (
    <Circle center={searchCenterPointArray} radius={searchRadius} color="blue" fill={false} />
  );
}
