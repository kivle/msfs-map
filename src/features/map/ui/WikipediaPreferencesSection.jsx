import * as React from 'react';
import ISO6391 from 'iso-639-1';
import styles from './Preferences.module.css';

export default function WikipediaPreferencesSection({
  edition,
  availableEditions,
  onChangeEdition
}) {
  return (
    <div className={styles.preference}>
      <label htmlFor="wikipedia-edition">Wikipedia Edition</label>
      <select id="wikipedia-edition" onChange={onChangeEdition} value={edition}>
        {availableEditions.map((e) => (
          <option key={e} value={e}>
            {ISO6391.getName(e) ? `${ISO6391.getName(e)} (${e})` : e}
          </option>
        ))}
      </select>
    </div>
  );
}
