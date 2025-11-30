import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defaultMapLayerVisibility, mapLayerDefinitions } from '../mapLayers';
import { selectMapLayerVisibility, selectMapLayersEnabled, setMapLayers, setMapLayersEnabled } from '../mapSlice';
import { savePreference } from '../../../utils/prefs';
import styles from './MapLayerContainer.module.css';

export default function MapLayerContainer() {
  const dispatch = useDispatch();
  const visibility = useSelector(selectMapLayerVisibility);
  const layersEnabled = useSelector(selectMapLayersEnabled);

  const resolvedVisibility = React.useMemo(() => ({
    ...defaultMapLayerVisibility,
    ...(visibility ?? {})
  }), [visibility]);

  const toggleLayer = React.useCallback((layerId) => {
    const updated = {
      ...resolvedVisibility,
      [layerId]: !resolvedVisibility[layerId]
    };
    dispatch(setMapLayers(updated));
    savePreference('mapLayers', updated).catch(() => {});
  }, [dispatch, resolvedVisibility]);

  const toggleAllLayers = React.useCallback(() => {
    const next = !layersEnabled;
    dispatch(setMapLayersEnabled(next));
    savePreference('mapLayersEnabled', next).catch(() => {});
  }, [dispatch, layersEnabled]);

  return (
    <div className={styles.container}>
      <div className={styles.heading}>Map layers</div>
      <div className={styles.subheading}>Show or hide available point sets.</div>
      <button
        type="button"
        className={`${styles.layerButton} ${styles.globalToggle}${layersEnabled ? ` ${styles.enabled}` : ''}`}
        onClick={toggleAllLayers}
        aria-pressed={layersEnabled}
      >
        <span className={styles.label}>Point layers</span>
        <span className={styles.state}>{layersEnabled ? 'On' : 'Off'}</span>
      </button>
      <div className={styles.layers}>
        {mapLayerDefinitions.map((layer) => {
          const enabled = resolvedVisibility[layer.id];
          const disabled = !layersEnabled;
          return (
            <button
              key={layer.id}
              type="button"
              className={`${styles.layerButton} ${styles.childLayer}${enabled ? ` ${styles.enabled}` : ''}${disabled ? ` ${styles.disabled}` : ''}`}
              aria-pressed={enabled}
              onClick={disabled ? undefined : () => toggleLayer(layer.id)}
              disabled={disabled}
            >
              <span
                className={styles.color}
                style={{ backgroundColor: layer.color }}
                aria-hidden="true"
              />
              <span className={styles.label}>{layer.label}</span>
              <span className={styles.state}>{enabled ? 'On' : 'Off'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
