import React from 'react';
import { 
  useKeyboardEffect, usePlaybackCallbacks, 
  useTtsPlaybackEffect, useTtsState 
} from './hooks';
import View from './View';

export default function TtsPlayer() {
  const {
    page,
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
      page={page}
      togglePlaybackState={togglePlaybackState}
      isPlaying={isPlaying}
      next={next}
      playQueue={playQueue}
    />
  );
}
