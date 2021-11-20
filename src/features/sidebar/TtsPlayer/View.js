import React from 'react';
import styles from './TtsPlayer.module.css';
import DistanceVisualizer from '../DistanceVisualizer';
import Thumbnail from './Thumbnail';
import ButtonBar from './ButtonBar';

const View = ({
  currentPage, togglePlaybackState, isPlaying, next, linkCurrent, linkNext, nextPage
}) => {
  
  const currentPageLink = currentPage
  ? <a href={linkCurrent} target="_blank" rel="noopener noreferrer">{currentPage.title}</a>
  : null;

  const nextPageLink = nextPage
    ? <a href={linkNext} target="_blank" rel="noopener noreferrer">{nextPage.title}</a>
    : null;

  return (
    <div className={styles.player}>
      <div className={styles.image}>
        <Thumbnail page={currentPage} />
      </div>
      <div className={styles.info}>
        {!currentPageLink && <article className={styles.title}>No articles in reading queue</article>}
        {currentPageLink && <article className={styles.title}>
          <div>{currentPageLink}</div>
          <DistanceVisualizer page={currentPage} />
        </article>}
        {nextPageLink && <article className={styles.next}>next: {nextPageLink}</article>}
      </div>
      <ButtonBar
        isPlaying={isPlaying}
        togglePlaybackState={togglePlaybackState}
        next={next}
      />
    </div>
  );
}

export default React.memo(View);
