import React from 'react';
import styles from './View.module.css';
import ButtonBar from './ButtonBar';
import WikipediaPage from '../WikipediaPage/WikipediaPage';

const View = ({
  currentPage, togglePlaybackState, isPlaying, next, playQueue
}) => {
  
  return (
    <>
      <div className={styles.player}>
        <div className={styles.info}>
          {!currentPage && `No articles in reading queue`}
          {currentPage && `${playQueue.length} articles in reading queue`}
        </div>
        <ButtonBar
          isPlaying={isPlaying}
          togglePlaybackState={togglePlaybackState}
          next={next}
        />
      </div>
      {currentPage && <WikipediaPage page={currentPage} />}
    </>
  );
}

export default React.memo(View);
