import * as React from "react";

import PlaneInfo from './ui/PlaneInfo';
import SettingsPanel from './ui/SettingsPanel';
import ButtonBar from './ui/ButtonBar';
import TtsPanel from './ui/TtsPanel';

import styles from './UI.module.css';

export default function UI() {
  return (
    <div className={styles.ui}>
      <PlaneInfo />
      <SettingsPanel />
      <ButtonBar />
      <TtsPanel />
    </div>
  );
}
