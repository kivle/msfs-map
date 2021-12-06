import React from 'react';
import styles from './View.module.css';
import ButtonBar from './ButtonBar';

const View = ({
  page, togglePlaybackState, isPlaying, next, playQueue
}) => {
  
  return (
    <>
      <div className={styles.player}>
        <div className={styles.info}>
          {!page && `No articles in reading queue`}
          {page && `${playQueue.length} articles in reading queue`}
        </div>
        <ButtonBar
          isPlaying={isPlaying}
          togglePlaybackState={togglePlaybackState}
          next={next}
        />
      </div>
    </>
  );
}

export default React.memo(View);
