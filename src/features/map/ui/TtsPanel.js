import React from 'react';
import { useSelector } from 'react-redux';
import TtsPlayer from '../../tts/TtsPlayer/TtsPlayer';
import WikipediaPage from '../../wikipedia/WikipediaPage/WikipediaPage';
import { selectIsEnabled, selectPlayingPage } from '../../wikipedia/wikipediaSlice';
import styles from './TtsPanel.module.css';

export default function TtsPanel() {
  const isEnabled = useSelector(selectIsEnabled);
  const {
    page,
    closestPoint,
    isInFront
  } = useSelector(selectPlayingPage) ?? {};

  return isEnabled ? (
    <div className={styles.ttsPanel}>
      <TtsPlayer />
      {page && <WikipediaPage 
                page={page} 
                closestPoint={closestPoint}
                isInFront={isInFront} 
      />}
    </div>
  ) : null;
}
