import * as React from 'react';
import styles from './Preferences.module.css';

export default function MapPreferencesSection({
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
