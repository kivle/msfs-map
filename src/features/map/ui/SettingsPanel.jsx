import * as React from 'react';
import { FaCog, FaCaretRight, FaLayerGroup } from 'react-icons/fa';
import MapLayerContainer from './MapLayerContainer';
import { useExpandedState } from './hooks';
import { PreferencesPanelContainer } from './Preferences';
import styles from './SettingsPanel.module.css';

export default function SettingsPanel() {
  const { openPanel, togglePanel } = useExpandedState();

  const preferencesOpen = openPanel === 'preferences';
  const layersOpen = openPanel === 'layers';

  return (
    <div className={styles.main}>
      <div className={styles.buttonRow}>
        <button 
          className={`${styles.preferenceButton}${preferencesOpen ? ` ${styles.expanded}` : ''}`}
          onClick={() => togglePanel('preferences')}>
          <FaCog size="100%" />
          <FaCaretRight className={styles.caret} />
        </button>
        <button
          className={`${styles.preferenceButton}${layersOpen ? ` ${styles.expanded}` : ''}`}
          onClick={() => togglePanel('layers')}>
          <FaLayerGroup size="100%" />
          <FaCaretRight className={styles.caret} />
        </button>
      </div>
      {!!preferencesOpen && <PreferencesPanelContainer />}
      {!!layersOpen && <MapLayerContainer />}
    </div>
  );
}
