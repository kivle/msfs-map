import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { groupedLayerDefinitions, defaultMapLayerVisibility } from '../mapLayers';
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

  const buildLayerSources = useMemo(() => (definitions) => definitions
    .filter((layer) => layer.fileName)
    .map((layer) => ({
      ...layer,
      url: new URL(layer.fileName, `${window.location.origin}${baseUrl}`).toString(),
      fallbackUrl: baseUrl !== '/'
        ? new URL(layer.fileName, window.location.origin).toString()
        : null
    })), []);

  const layerSources = useMemo(
    () => buildLayerSources(groupedLayerDefinitions.pointLayers),
    [buildLayerSources]
  );

  const extraLayerSources = useMemo(
    () => buildLayerSources(groupedLayerDefinitions.extraPointLayers),
    [buildLayerSources]
  );

  return (
    <>
      {layersEnabled && layerSources
        .filter((layer) => resolvedVisibility[layer.id])
        .map((layer) => <MapPointLayer key={layer.id} layer={layer} />)}
      {extraLayerSources
        .filter((layer) => resolvedVisibility[layer.id])
        .map((layer) => <MapPointLayer key={layer.id} layer={layer} />)}
    </>
  );
}
