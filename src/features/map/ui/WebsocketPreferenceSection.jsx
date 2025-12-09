import * as React from 'react';
import styles from './Preferences.module.css';

export default function WebsocketPreferenceSection({
  value,
  onChange,
  onBlur
}) {
  return (
    <div className={styles.preference}>
      <label htmlFor="websocketUrl">URL or IP to simconnect-ws server (leave blank for default)</label>
      <input
        id="websocketUrl"
        type="text"
        placeholder="ws://localhost:9000/ws"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onBlur(value)}
      />
    </div>
  );
}
