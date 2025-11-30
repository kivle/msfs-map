import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { mapLayerDefinitions, defaultMapLayerVisibility } from '../mapLayers';
import { selectMapLayerVisibility, selectMapLayersEnabled } from '../mapSlice';
import MapPointLayer from './MapPointLayer';

const ensureTrailingSlash = (value) => value.endsWith('/') ? value : `${value}/`;
const baseUrl = ensureTrailingSlash(import.meta?.env?.BASE_URL ?? '/');

export default function PointLayers() {
  const visibility = useSelector(selectMapLayerVisibility);
  const layersEnabled = useSelector(selectMapLayersEnabled);
  const resolvedVisibility = useMemo(() => ({
    ...defaultMapLayerVisibility,
    ...(visibility ?? {})
  }), [visibility]);

  const layerSources = useMemo(() => mapLayerDefinitions.map((layer) => ({
    ...layer,
    url: new URL(layer.fileName, `${window.location.origin}${baseUrl}`).toString(),
    fallbackUrl: baseUrl !== '/'
      ? new URL(layer.fileName, window.location.origin).toString()
      : null
  })), []);

  if (!layersEnabled) return null;

  return layerSources
    .filter((layer) => resolvedVisibility[layer.id])
    .map((layer) => <MapPointLayer key={layer.id} layer={layer} />);
}
