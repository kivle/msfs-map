import { useCallback, useEffect } from "react";
import striptags from 'striptags';
import { decode } from 'entities';
import { useDispatch, useSelector } from "react-redux";
import { selectIsPlaying, selectVoice, setIsPlaying } from "../ttsSlice";
import { advancePlayQueue, selectPlayQueue } from "../../wikipedia/wikipediaSlice";

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

export function useTtsPlaybackEffect(isPlaying, title, extract, next, voice) {
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
    [isPlaying, title, extract, next, voice]
  );
}

export function usePlaybackCallbacks(isPlaying) {
  const dispatch = useDispatch();

  const togglePlaybackState = useCallback(() => {
    dispatch(setIsPlaying(!isPlaying));
  }, [dispatch, isPlaying]);

  const next = useCallback(() => {
    dispatch(advancePlayQueue());
  }, [dispatch]);

  return {
    togglePlaybackState,
    next
  };
}

export function useTtsState() {
  const playQueue = useSelector(selectPlayQueue);
  const currentPage = playQueue[0];
  const { title, extract } = currentPage ?? {};
  const voice = useSelector(selectVoice);
  const isPlaying = useSelector(selectIsPlaying);

  return {
    currentPage,
    title,
    extract,
    voice,
    isPlaying,
    playQueue
  };
}
