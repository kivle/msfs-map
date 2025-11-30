import * as React from 'react';
import styles from './Preferences.module.css';

export default function MapPreferencesSection({
  currentMap,
  availableMaps,
  detectRetina,
  onChangeMap,
  onChangeDetectRetina,
  visualizeSearchRadius,
  onChangeVisualizeSearchRadius,
  courseLine,
  onChangeCourseLine
}) {
  return (
    <>
      <div className={styles.preference}>
        <label htmlFor="mapserver">Map</label>
        <select id="mapserver" onChange={onChangeMap} value={currentMap?.id}>
          {availableMaps.map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </div>
      <div className={styles.preference}>
        <label htmlFor="detectRetina">Use High-DPI tile for this map</label>
        <input
          id="detectRetina"
          type="checkbox"
          checked={detectRetina}
          onChange={(e) => onChangeDetectRetina(e.target.checked)}
        />
      </div>
      <div className={styles.preference}>
        <label htmlFor="visualizeSearchRadius">Visualize search radius on map</label>
        <input
          id="visualizeSearchRadius"
          type="checkbox"
          checked={visualizeSearchRadius}
          onChange={(e) => onChangeVisualizeSearchRadius(e.target.checked)}
        />
      </div>
      <div className={styles.preference}>
        <label htmlFor="showCourseLine">Show course line</label>
        <input
          id="showCourseLine"
          type="checkbox"
          checked={courseLine}
          onChange={(e) => onChangeCourseLine(e.target.checked)}
        />
      </div>
    </>
  );
}
