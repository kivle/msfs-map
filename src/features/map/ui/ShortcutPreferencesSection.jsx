import * as React from 'react';
import styles from './Preferences.module.css';
import ShortcutMappings from './ShortcutMappings';

export default function ShortcutPreferencesSection({
  connectedGamepads,
  shortcutMappings,
  changeShortcutMappings
}) {
  return (
    <div className={styles.preference}>
      <ShortcutMappings
        connectedGamepads={connectedGamepads}
        shortcutMappings={shortcutMappings}
        changeShortcutMappings={changeShortcutMappings}
      />
    </div>
  );
}
