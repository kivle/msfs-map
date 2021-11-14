import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { advancePlayQueue, selectPlayQueue } from '../wikipedia/wikipediaSlice';
import { selectIsPlaying, selectVoice, setIsPlaying } from '../tts/ttsSlice';
import striptags from 'striptags';
import { decode } from 'entities';
import { FaPlay, FaPause, FaStepForward } from 'react-icons/fa';
import styles from './TtsPlayer.module.css';
import { useWikipediaPageLink } from '../wikipedia/hooks';
import { HiOutlineArrowNarrowUp } from 'react-icons/hi';
import { formatDistance } from '../../utils/geo';

function Thumbnail({ page }) {
  return page?.thumbnail?.source
    ? (
      <a href={page.thumbnail.source} target="_blank" rel="noopener noreferrer">
        <img src={page.thumbnail.source} alt={page.title} />
      </a>
    ) : null;
}

export function TtsPlayer() {
  const dispatch = useDispatch();
  const playQueue = useSelector(selectPlayQueue);
  const currentPage = playQueue[0];
  const nextPage = playQueue[1];
  const { title, extract } = currentPage ?? {};
  const { distance, headingDifference } = currentPage?.closestPoint ?? {};
  const voice = useSelector(selectVoice);
  const isPlaying = useSelector(selectIsPlaying);

  const linkCurrent = useWikipediaPageLink(currentPage);
  const linkNext = useWikipediaPageLink(nextPage);
  
  const togglePlaybackState = useCallback(() => {
    dispatch(setIsPlaying(!isPlaying));
  }, [dispatch, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      speechSynthesis.cancel();
    }
  }, [isPlaying]);

  const next = useCallback(() => {
    dispatch(advancePlayQueue());
  }, [dispatch]);

  useEffect(
    () => {
      if (!isPlaying || !title || !extract || !voice) return;

      // Page is rated good and should be read by tts
      const text = `${title}\n\n${extract ? decode(striptags(extract)) : ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speechSynthesis.getVoices().find(v => v.name === voice);
      utterance.onend = () => {
        next();
      };
      speechSynthesis.speak(utterance);
      return () => {
        utterance.onend = null;
        speechSynthesis.cancel();
      };
    },
    [isPlaying, title, extract, next, voice]
  );

  useEffect(
    () => {
      const keyHandler = (e) => {
        if (e.key === 'n') {
          next();
        }
        else if (e.key === ' ') {
          togglePlaybackState();
        }
      };

      document.addEventListener('keypress', keyHandler);
      return () => document.removeEventListener('keypress', keyHandler);
    }
  , [next, togglePlaybackState]);

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
          <div className={styles.distance}>
            <HiOutlineArrowNarrowUp
              size={12} 
              style={{transform: `rotate(${headingDifference ?? 0}deg)`}}
              />
            <span>{formatDistance(distance)}</span>
          </div>
        </article>}
        {nextPageLink && <article className={styles.next}>next: {nextPageLink}</article>}
      </div>
      <div className={styles.controls}>
        <button className={`${styles.btn} ${styles.gap}`} onClick={togglePlaybackState}>
          {isPlaying && <FaPause size="100%" />}
          {!isPlaying && <FaPlay size="100%" />}
        </button>
        <button className={`${styles.btn}`} onClick={next}>
          <FaStepForward size="100%" />
        </button>
      </div>
    </div>
  );
}
