import React from 'react';
import { useWikipediaPageLink } from '../../wikipedia/hooks';
import { useKeyboardEffect, usePlaybackCallbacks, useTtsPlaybackEffect, useTtsState } from './hooks';
import View from './View';

export function TtsPlayer() {
  const {
    currentPage,
    nextPage,
    title,
    extract,
    voice,
    isPlaying
  } = useTtsState();

  const linkCurrent = useWikipediaPageLink(currentPage);
  const linkNext = useWikipediaPageLink(nextPage);
  
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
      linkCurrent={linkCurrent}
      linkNext={linkNext}
      nextPage={nextPage}
    />
  );
}
