import reducer, { toggleIsPlaying, setAutoPlay, setVoice, setAvailableVoices } from '../ttsSlice';

describe('ttsSlice reducer', () => {
  it('toggles isPlaying', () => {
    const state = reducer(undefined, toggleIsPlaying());
    expect(state.isPlaying).toBe(true);
  });

  it('enables autoplay and starts playing', () => {
    const state = reducer(undefined, setAutoPlay(true));
    expect(state.autoPlay).toBe(true);
    expect(state.isPlaying).toBe(true);
  });

  it('sets current voice when available', () => {
    const initial = reducer(undefined, setAvailableVoices(['Voice1', 'Voice2']));
    const next = reducer(initial, setVoice('Voice2'));
    expect(next.currentVoice).toBe('Voice2');
  });
});
