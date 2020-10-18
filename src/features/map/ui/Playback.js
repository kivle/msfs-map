import * as React from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { FaPlay, FaPause, FaStepForward } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { nextPage, selectCurrentPage, selectIsPlaying, selectVoice, setIsPlaying } from '../../wikipedia/wikipediaSlice';
import striptags from 'striptags';
import { decode } from 'entities';

import styles from './Playback.module.css';

export default React.memo(function Playback() {
  const dispatch = useDispatch();
  const page = useSelector(selectCurrentPage);
  const voice = useSelector(selectVoice);
  const isPlaying = useSelector(selectIsPlaying);
  
  const togglePlaybackState = useCallback(() => {
    if (isPlaying) {
      speechSynthesis.cancel();
    }
    dispatch(setIsPlaying(!isPlaying));
  }, [dispatch, isPlaying]);

  const next = useCallback(() => {
    dispatch(nextPage());
  }, [dispatch]);

  useEffect(
    () => {
      if (!isPlaying || !page) return;

      if (page.rating === 'good') {
        // Page is rated good and should be read by tts
        const text = `${page.title}\n\n${page.extract ? decode(striptags(page.extract)) : ''}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = window.speechSynthesis.getVoices().find(v => v.name === voice);
        utterance.onend = () => {
          next();
        };
        window.speechSynthesis.speak(utterance);
        return () => {
          utterance.onend = null;
          speechSynthesis.cancel();
        };
      }
      else {
        // Bad or unrated article.. just display it for 5 seconds
        const timeout = setTimeout(() => next(), 8000);
        return () => clearTimeout(timeout);
      }
    },
    [isPlaying, page, next, voice]
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
  
  return (
    <div className={styles.main}>
      <button className={styles.btn} onClick={togglePlaybackState}>
        {isPlaying && <FaPause size="100%" />}
        {!isPlaying && <FaPlay size="100%" />}
      </button>
      <button className={`${styles.btn} ${styles.gap}`} onClick={next}><FaStepForward size="100%" /></button>
    </div>
  );
});
