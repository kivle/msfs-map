import React from 'react';
import { 
  useKeyboardEffect, usePlaybackCallbacks, 
  useTtsPlaybackEffect, useTtsState 
} from './hooks';
import View from './View';

export default function TtsPlayer() {
  const {
    title,
    extract,
    voice,
    isPlaying
  } = useTtsState();

  const {
    togglePlaybackState,
    next
  } = usePlaybackCallbacks();
  
  useTtsPlaybackEffect(isPlaying, title, extract, next, voice, togglePlaybackState);
  useKeyboardEffect(next, togglePlaybackState);

  return (
    <View
      togglePlaybackState={togglePlaybackState}
      isPlaying={isPlaying}
      next={next}
    />
  );
}
