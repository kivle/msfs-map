import React from 'react';
import { FaPause, FaPlay, FaStepForward } from 'react-icons/fa';
import styles from './View.module.css';

const ButtonBar = ({
  togglePlaybackState, isPlaying, next
}) => (
  <div className={styles.controls}>
    <button className={`${styles.btn} ${styles.gap}`} onClick={togglePlaybackState}>
      {isPlaying && <FaPause size="100%" />}
      {!isPlaying && <FaPlay size="100%" />}
    </button>
    <button className={`${styles.btn}`} onClick={next}>
      <FaStepForward size="100%" />
    </button>
  </div>
)

export default React.memo(ButtonBar);
