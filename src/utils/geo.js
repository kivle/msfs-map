export function formatDistance(distance) {
  if (distance !== 0 && !distance) {
    return '';
  }

  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  }
  else if (distance < 100000) {
    return `${(distance / 1000).toFixed(1)} km`
  }
  else {
    return `${Math.round(distance / 1000)} km`;
  }
}

export function formatBearing(bearing) {
  if (bearing !== 0 && !bearing) {
    return '';
  }

  return `${Math.round(bearing)}°`;
}
