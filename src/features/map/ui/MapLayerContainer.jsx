import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defaultMapLayerVisibility, groupedLayerDefinitions } from '../mapLayers';
import {
  selectAvailableMaps,
  selectCurrentMap,
  selectDetectRetinaByMap,
  selectDetectRetinaForCurrentMap,
  selectMapLayerVisibility,
  selectMapLayersEnabled,
  setCurrentMap,
  setDetectRetina,
  setMapLayers,
  setMapLayersEnabled
} from '../mapSlice';
import { savePreference } from '../../../utils/prefs';
import styles from './MapLayerContainer.module.css';

export default function MapLayerContainer() {
  const dispatch = useDispatch();
  const visibility = useSelector(selectMapLayerVisibility);
  const layersEnabled = useSelector(selectMapLayersEnabled);
  const currentMap = useSelector(selectCurrentMap);
  const availableMaps = useSelector(selectAvailableMaps);
  const detectRetina = useSelector(selectDetectRetinaForCurrentMap);
  const detectRetinaByMap = useSelector(selectDetectRetinaByMap);

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

  const handleMapChange = React.useCallback((e) => {
    const mapId = e.target.value;
    dispatch(setCurrentMap(mapId));
    savePreference('currentMap', mapId).catch(() => {});
  }, [dispatch]);

  const handleDetectRetinaChange = React.useCallback((checked) => {
    const mapId = currentMap?.id;
    if (!mapId) return;
    dispatch(setDetectRetina({ mapId, enabled: checked }));
    const updated = { ...(detectRetinaByMap ?? {}) };
    updated[mapId] = checked;
    savePreference('detectRetinaByMap', updated).catch(() => {});
  }, [dispatch, currentMap, detectRetinaByMap]);

  return (
    <div className={styles.container}>
      <div className={styles.preferenceGroup}>
        <div className={styles.preferenceRow}>
          <label htmlFor="mapserver" className={styles.labelText}>Base map</label>
          <select id="mapserver" onChange={handleMapChange} value={currentMap?.id} className={styles.select}>
            {availableMaps.map(({ id, name }) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <div className={styles.preferenceRow}>
          <label htmlFor="detectRetina" className={styles.labelText}>Use High-DPI tiles</label>
          <input
            id="detectRetina"
            type="checkbox"
            checked={detectRetina}
            onChange={(e) => handleDetectRetinaChange(e.target.checked)}
          />
        </div>
      </div>
      <div className={styles.heading}>Map layers</div>
      <div className={styles.subheading}>Choose map settings and show or hide point sets.</div>
      <button
        type="button"
        className={`${styles.layerButton} ${styles.globalToggle}${layersEnabled ? ` ${styles.enabled}` : ''}`}
        onClick={toggleAllLayers}
        aria-pressed={layersEnabled}
      >
        <span className={styles.label}>MSFS layers</span>
        <span className={styles.state}>{layersEnabled ? 'On' : 'Off'}</span>
      </button>
      <div className={styles.layers}>
        {groupedLayerDefinitions.pointLayers.map((layer) => {
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
      <div className={styles.layers}>
        <div className={styles.sectionLabel}>Global data</div>
        {groupedLayerDefinitions.extraPointLayers.map((layer) => {
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
