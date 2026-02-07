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
import { clearFavorites, loadFavorites, normalizeFavoritesList, saveFavorites } from '../favoritesStorage';
import styles from './MapLayerContainer.module.css';

const KML_MIME = 'application/vnd.google-earth.kml+xml';
const KML_NS = 'http://www.opengis.net/kml/2.2';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function favoritesToKml(favorites) {
  const placemarks = favorites.map((favorite) => {
    const name = escapeXml(favorite.name);
    const lng = Number(favorite.lng);
    const lat = Number(favorite.lat);
    return [
      '    <Placemark>',
      `      <name>${name}</name>`,
      '      <Point>',
      `        <coordinates>${lng},${lat},0</coordinates>`,
      '      </Point>',
      '    </Placemark>'
    ].join('\n');
  }).join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<kml xmlns="${KML_NS}">`,
    '  <Document>',
    placemarks,
    '  </Document>',
    '</kml>',
    ''
  ].join('\n');
}

function kmlToFavorites(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) {
    throw new Error('Invalid KML');
  }

  const placemarks = Array.from(doc.getElementsByTagName('Placemark'));
  return placemarks.map((placemark, index) => {
    const nameNode = placemark.getElementsByTagName('name')[0];
    const name = (nameNode?.textContent || '').trim() || `Favorite ${index + 1}`;
    const pointNode = placemark.getElementsByTagName('Point')[0];
    const coordinatesNode = (pointNode || placemark).getElementsByTagName('coordinates')[0];
    const rawCoordinates = (coordinatesNode?.textContent || '').trim();
    const firstCoordinate = rawCoordinates.split(/\s+/).find(Boolean) || '';
    const [lngText, latText] = firstCoordinate.split(',');
    const lng = Number(lngText);
    const lat = Number(latText);
    return { name, lat, lng };
  });
}

export default function MapLayerContainer() {
  const dispatch = useDispatch();
  const fileInputRef = React.useRef(null);
  const visibility = useSelector(selectMapLayerVisibility);
  const layersEnabled = useSelector(selectMapLayersEnabled);
  const currentMap = useSelector(selectCurrentMap);
  const availableMaps = useSelector(selectAvailableMaps);
  const detectRetina = useSelector(selectDetectRetinaForCurrentMap);
  const detectRetinaByMap = useSelector(selectDetectRetinaByMap);
  const isRasterMap = currentMap?.renderType === 'raster';

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

  const handleExportFavorites = React.useCallback(async () => {
    try {
      const favorites = await loadFavorites();
      const payload = favoritesToKml(favorites);
      const blob = new Blob([payload], { type: KML_MIME });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `msfs-map-favorites-${new Date().toISOString().slice(0, 10)}.kml`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      // ignore export errors
    }
  }, []);

  const handleImportClick = React.useCallback(() => {
    fileInputRef.current?.click?.();
  }, []);

  const handleImportFile = React.useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const entries = kmlToFavorites(text);
      const normalized = normalizeFavoritesList(entries);
      await saveFavorites(normalized);
    } catch {
      // ignore import errors
    } finally {
      event.target.value = '';
    }
  }, []);

  const handleClearFavorites = React.useCallback(async () => {
    if (!window.confirm('Clear all favorites?')) return;
    await clearFavorites();
  }, []);

  const favoritesLayer = groupedLayerDefinitions.extraPointLayers.find((layer) => layer.id === 'favorites');
  const extraLayers = groupedLayerDefinitions.extraPointLayers.filter((layer) => layer.id !== 'favorites');

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
        {isRasterMap && (
          <div className={styles.preferenceRow}>
            <label htmlFor="detectRetina" className={styles.labelText}>Use High-DPI tiles</label>
            <input
              id="detectRetina"
              type="checkbox"
              checked={detectRetina}
              onChange={(e) => handleDetectRetinaChange(e.target.checked)}
            />
          </div>
        )}
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
        {extraLayers.map((layer) => {
          const enabled = resolvedVisibility[layer.id];
          return (
            <div key={layer.id} className={styles.layerGroup}>
              <button
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
              {layer.id === 'favorites' && (
                <div className={styles.favoritesActions}>
                  <button type="button" className={styles.favoritesButton} onClick={handleExportFavorites}>
                    Save
                  </button>
                  <button type="button" className={styles.favoritesButton} onClick={handleImportClick}>
                    Load
                  </button>
                  <button type="button" className={styles.favoritesButton} onClick={handleClearFavorites}>
                    Clear
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".kml,application/vnd.google-earth.kml+xml,application/xml,text/xml"
                    className={styles.hiddenInput}
                    onChange={handleImportFile}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {favoritesLayer && (
        <div className={styles.layers}>
          <div className={styles.sectionLabel}>Favorites</div>
          <div className={styles.layerGroup}>
            <button
              type="button"
              className={`${styles.layerButton}${resolvedVisibility[favoritesLayer.id] ? ` ${styles.enabled}` : ''}`}
              aria-pressed={resolvedVisibility[favoritesLayer.id]}
              onClick={() => toggleLayer(favoritesLayer.id)}
            >
              <span
                className={styles.color}
                style={{ backgroundColor: favoritesLayer.color }}
                aria-hidden="true"
              />
              <span className={styles.label}>{favoritesLayer.label}</span>
              <span className={styles.state}>{resolvedVisibility[favoritesLayer.id] ? 'On' : 'Off'}</span>
            </button>
            <div className={styles.favoritesActions}>
              <button type="button" className={styles.favoritesButton} onClick={handleExportFavorites}>
                Save
              </button>
              <button type="button" className={styles.favoritesButton} onClick={handleImportClick}>
                Load
              </button>
              <button type="button" className={styles.favoritesButton} onClick={handleClearFavorites}>
                Clear
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".kml,application/vnd.google-earth.kml+xml,application/xml,text/xml"
                className={styles.hiddenInput}
                onChange={handleImportFile}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
