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
  onChangeCourseLine,
  marchingSpeedKnots,
  onChangeMarchingSpeedKnots
}) {
  const [speedInput, setSpeedInput] = React.useState(() => marchingSpeedKnots?.toString?.() ?? '120');

  React.useEffect(() => {
    setSpeedInput(marchingSpeedKnots?.toString?.() ?? '120');
  }, [marchingSpeedKnots]);

  const handleSpeedChange = React.useCallback((e) => {
    const value = e.target.value;
    setSpeedInput(value);
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      onChangeMarchingSpeedKnots(numeric);
    }
  }, [onChangeMarchingSpeedKnots]);

  const handleSpeedBlur = React.useCallback(() => {
    const numeric = Number(speedInput);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setSpeedInput(marchingSpeedKnots?.toString?.() ?? '120');
    } else {
      onChangeMarchingSpeedKnots(numeric);
    }
  }, [speedInput, marchingSpeedKnots, onChangeMarchingSpeedKnots]);

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
      <div className={styles.preference}>
        <label htmlFor="marchingSpeed">Average cruising speed (knots)</label>
        <input
          id="marchingSpeed"
          type="number"
          min="1"
          step="1"
          value={speedInput}
          onChange={handleSpeedChange}
          onBlur={handleSpeedBlur}
        />
      </div>
    </>
  );
}
