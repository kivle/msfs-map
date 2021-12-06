import React from 'react';
import { useSelector } from 'react-redux';
import TtsPlayer from '../../tts/TtsPlayer/TtsPlayer';
import WikipediaPage from '../../wikipedia/WikipediaPage/WikipediaPage';
import { selectIsEnabled, selectPlayQueue } from '../../wikipedia/wikipediaSlice';
import styles from './TtsPanel.module.css';

export default function TtsPanel() {
  const isEnabled = useSelector(selectIsEnabled);
  const {
    page,
    closestPoint,
    isInPlayQueue,
    isInFront
  } = useSelector(selectPlayQueue)[0] ?? {};

  return isEnabled ? (
    <div className={styles.ttsPanel}>
      <TtsPlayer />
      {page && <WikipediaPage 
                page={page} 
                closestPoint={closestPoint} 
                isInPlayQueue={isInPlayQueue} 
                isInFront={isInFront} 
      />}
    </div>
  ) : null;
}
