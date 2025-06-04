import { createSlice } from '@reduxjs/toolkit';

export const ttsSlice = createSlice({
  name: 'tts',
  initialState: {
    currentVoice: undefined,
    availableVoices: [],
    isPlaying: false,
    autoPlay: false
  },
  reducers: {
    setVoice: (state, action) => {
      const voice = action.payload;
      state.currentVoice = voice;
    },
    setAvailableVoices: (state, action) => {
      const voices = action.payload;
      state.availableVoices = voices;
      if (state.currentVoice && !state.availableVoices.some(v => v === state.currentVoice))
        state.currentVoice = undefined;
    },
    toggleIsPlaying: (state, action) => {
      state.isPlaying = !state.isPlaying;
    },
    setAutoPlay: (state, action) => {
      state.autoPlay = action.payload;
      if (action.payload)
        state.isPlaying = true;
    }
  },
});

export const {
  setVoice,
  setAvailableVoices,
  toggleIsPlaying,
  setAutoPlay
} = ttsSlice.actions;

export const selectVoice = (state) => state.tts.currentVoice;

export const selectAvailableVoices = (state) => state.tts.availableVoices;

export const selectIsPlaying = (state) => state.tts.isPlaying;

export const selectAutoPlay = (state) => state.tts.autoPlay;

export default ttsSlice.reducer;
