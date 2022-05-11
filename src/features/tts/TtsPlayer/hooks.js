import { useCallback, useEffect } from "react";
import striptags from 'striptags';
import { decode } from 'entities';
import { useDispatch, useSelector } from "react-redux";
import { selectAutoPlay, selectIsPlaying, selectVoice, toggleIsPlaying } from "../ttsSlice";
import { playNext, selectPlayingPage } from "../../wikipedia/wikipediaSlice";

export function useKeyboardEffect(next, togglePlaybackState) {
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
}

export function useTtsPlaybackEffect(isPlaying, title, extract, next, voice, togglePlaybackState) {
  const autoPlay = useSelector(selectAutoPlay);

  useEffect(() => {
    if (!isPlaying) {
      speechSynthesis.cancel();
    }
  }, [isPlaying]);

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
    [isPlaying, title, extract, next, voice, autoPlay, togglePlaybackState]
  );
}

export function usePlaybackCallbacks() {
  const dispatch = useDispatch();

  const togglePlaybackState = useCallback(() => {
    dispatch(toggleIsPlaying());
  }, [dispatch]);

  const next = useCallback(() => {
    dispatch(playNext());
  }, [dispatch]);

  return {
    togglePlaybackState,
    next
  };
}

export function useTtsState() {
  const playingPage = useSelector(selectPlayingPage);
  const {
    page,
    closestPoint,
    isInFront
  } = playingPage ?? {};
  const { title, extract } = page ?? {};
  const voice = useSelector(selectVoice);
  const isPlaying = useSelector(selectIsPlaying);

  return {
    page,
    closestPoint,
    isInFront,
    title,
    extract,
    voice,
    isPlaying
  };
}
