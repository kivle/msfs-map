import React from 'react';
import { 
  useKeyboardEffect, usePlaybackCallbacks, 
  useTtsPlaybackEffect, useTtsState 
} from './hooks';
import View from './View';

export default function TtsPlayer() {
  const {
    currentPage,
    title,
    extract,
    voice,
    isPlaying,
    playQueue
  } = useTtsState();

  const {
    togglePlaybackState,
    next
  } = usePlaybackCallbacks(isPlaying);
  
  useTtsPlaybackEffect(isPlaying, title, extract, next, voice);
  useKeyboardEffect(next, togglePlaybackState);

  return (
    <View
      currentPage={currentPage}
      togglePlaybackState={togglePlaybackState}
      isPlaying={isPlaying}
      next={next}
      playQueue={playQueue}
    />
  );
}
