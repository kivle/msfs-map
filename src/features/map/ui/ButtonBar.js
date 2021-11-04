import * as React from 'react';
import { useEffect } from 'react';
import { useCallback } from 'react';
import { FaPlay, FaPause, FaStepForward, FaWikipediaW } from 'react-icons/fa';
import { CgTrack } from 'react-icons/cg';
import { useDispatch, useSelector } from 'react-redux';
import { 
  nextPage, selectCurrentPage, selectIsEnabled, selectIsPlaying, 
  selectVoice, setEnabled, setIsPlaying
} from '../../wikipedia/wikipediaSlice';
import {
  selectIsFollowing, setIsFollowing
} from '../mapSlice';
import striptags from 'striptags';
import { decode } from 'entities';

import styles from './ButtonBar.module.css';

export default React.memo(function ButtonBar() {
  const dispatch = useDispatch();
  const page = useSelector(selectCurrentPage);
  const { rating, title, extract } = page ?? {};
  const voice = useSelector(selectVoice);
  const isPlaying = useSelector(selectIsPlaying);
  
  const togglePlaybackState = useCallback(() => {
    dispatch(setIsPlaying(!isPlaying));
  }, [dispatch, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      speechSynthesis.cancel();
    }
  }, [isPlaying]);

  const next = useCallback(() => {
    dispatch(nextPage());
  }, [dispatch]);

  useEffect(
    () => {
      if (!isPlaying || !title || !extract || !voice) return;

      if (rating !== 'bad') {
        // Page is rated good and should be read by tts
        const text = `${title}\n\n${extract ? decode(striptags(extract)) : ''}`;
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
    [isPlaying, rating, title, extract, next, voice]
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

  const isFollowing = useSelector(selectIsFollowing);
  const toggleFollow = useCallback(() => {
    dispatch(setIsFollowing(!isFollowing));
  }, [dispatch, isFollowing]);

  const isWikipediaEnabled = useSelector(selectIsEnabled);
  const toggleIsEnabled = useCallback(() => {
    localStorage['wikipedia-enabled'] = JSON.stringify(!isWikipediaEnabled);
    dispatch(setEnabled(!isWikipediaEnabled));
  }, [dispatch, isWikipediaEnabled]);
  
  return (
    <div className={styles.main}>
      <button className={`${styles.btn} ${isFollowing ? styles.active : ''}`} onClick={toggleFollow}>
        <CgTrack size="100%" />
      </button>
      <button className={`${styles.btn} ${styles.gap} ${isWikipediaEnabled ? styles.active : ''}`} onClick={toggleIsEnabled}>
        <FaWikipediaW size="100%" />
      </button>
      {isWikipediaEnabled && <>
        <button className={`${styles.btn} ${styles.gap}`} onClick={togglePlaybackState}>
          {isPlaying && <FaPause size="100%" />}
          {!isPlaying && <FaPlay size="100%" />}
        </button>
        <button className={`${styles.btn}`} onClick={next}>
          <FaStepForward size="100%" />
        </button>
      </>}
    </div>
  );
});
