import React from 'react';
import styles from './View.module.css';
import ButtonBar from './ButtonBar';

const View = ({
  togglePlaybackState, isPlaying, next
}) => {
  
  return (
    <>
      <div className={styles.player}>
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
