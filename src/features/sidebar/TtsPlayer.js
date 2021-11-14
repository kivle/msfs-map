import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { advancePlayQueue, selectPlayQueue } from '../wikipedia/wikipediaSlice';
import styles from './Sidebar.module.css';
import { selectIsPlaying, selectVoice, setIsPlaying } from '../tts/ttsSlice';
import striptags from 'striptags';
import { decode } from 'entities';
import { FaPlay, FaPause, FaStepForward } from 'react-icons/fa';

export function TtsPlayer() {
  const dispatch = useDispatch();
  const playQueue = useSelector(selectPlayQueue);
  const currentPage = playQueue[0];
  const { title, extract } = currentPage ?? {};
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

  return (
    <>
      <button className={`${styles.btn} ${styles.gap}`} onClick={togglePlaybackState}>
        {isPlaying && <FaPause size="100%" />}
        {!isPlaying && <FaPlay size="100%" />}
      </button>
      <button className={`${styles.btn}`} onClick={next}>
        <FaStepForward size="100%" />
      </button>
    </>
  );
}
