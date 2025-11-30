import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defaultMapLayerVisibility, mapLayerDefinitions } from '../mapLayers';
import { selectMapLayerVisibility, setMapLayers } from '../mapSlice';
import { savePreference } from '../../../utils/prefs';
import styles from './MapLayerContainer.module.css';

export default function MapLayerContainer() {
  const dispatch = useDispatch();
  const visibility = useSelector(selectMapLayerVisibility);

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

  return (
    <div className={styles.container}>
      <div className={styles.heading}>Map layers</div>
      <div className={styles.subheading}>Show or hide available point sets.</div>
      <div className={styles.layers}>
        {mapLayerDefinitions.map((layer) => {
          const enabled = resolvedVisibility[layer.id];
          return (
            <button
              key={layer.id}
              type="button"
              className={`${styles.layerButton}${enabled ? ` ${styles.enabled}` : ''}`}
              aria-pressed={enabled}
              onClick={() => toggleLayer(layer.id)}
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
