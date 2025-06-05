import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ttsReducer from '../ttsSlice';
import wikipediaReducer from '../../wikipedia/wikipediaSlice';
import { usePlaybackCallbacks } from '../TtsPlayer/hooks';

describe('usePlaybackCallbacks', () => {
  it('dispatches actions on callbacks', () => {
    const store = configureStore({ reducer: { tts: ttsReducer, wikipedia: wikipediaReducer } });
    // add a page so playNext has something to mark as viewed
    store.dispatch({
      type: 'wikipedia/receivePages',
      payload: {
        data: { query: { pages: { 1: { pageid: 1, title: 'p1', coordinates: [{ lat:0, lon:0 }] } } } },
        searchPosition: [0,0],
        searchRadius: 100,
        searchTime: 0
      }
    });
    const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
    const { result } = renderHook(() => usePlaybackCallbacks(), { wrapper });
    result.current.togglePlaybackState();
    expect(store.getState().tts.isPlaying).toBe(true);
    result.current.next();
    result.current.next();
    expect(store.getState().wikipedia.pagesViewed.length).toBe(1);
  });
});
