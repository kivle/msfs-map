import { createSlice } from '@reduxjs/toolkit';

export const ttsSlice = createSlice({
  name: 'tts',
  initialState: {
    currentVoice: undefined,
    availableVoices: [],
    isPlaying: true
  },
  reducers: {
    setVoice: (state, action) => {
      const voice = action.payload;
      state.currentVoice = voice;
    },
    setAvailableVoices: (state, action) => {
      const voices = action.payload;
      state.availableVoices = voices;
      if (state.voice && !state.availableVoices.some(v => v === state.voice))
        state.voice = undefined;
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    }
  },
});

export const {
  setVoice,
  setAvailableVoices,
  setIsPlaying
} = ttsSlice.actions;

export const selectVoice = (state) => state.tts.currentVoice;

export const selectAvailableVoices = (state) => state.tts.availableVoices;

export const selectIsPlaying = (state) => state.tts.isPlaying;

export default ttsSlice.reducer;
