import * as React from 'react';
import styles from './Preferences.module.css';

export default function TtsPreferencesSection({
  voice,
  availableVoices,
  onChangeVoice,
  autoPlay,
  onChangeAutoPlay
}) {
  return (
    <>
      <div className={styles.preference}>
        <label htmlFor="voice">Voice</label>
        <select id="voice" onChange={onChangeVoice} value={voice}>
          {availableVoices.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </div>
      <div className={styles.preference}>
        <label htmlFor="autoPlay">Enable automatically reading next article</label>
        <input
          id="autoPlay"
          type="checkbox"
          checked={autoPlay}
          onChange={(e) => onChangeAutoPlay(e.target.checked)}
        />
      </div>
    </>
  );
}
