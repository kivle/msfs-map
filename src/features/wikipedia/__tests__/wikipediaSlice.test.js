import { configureStore } from '@reduxjs/toolkit';
import wikipediaReducer, {
  getPages,
  playNext,
  clearPagesOutOfRange,
  selectPagesWithDistances,
  selectPlayingPage,
  selectSearchCenterPoint,
  receivePages,
  updateCalculatedData,
  setEdition
} from '../wikipediaSlice';
import simdataReducer, { updateData } from '../../simdata/simdataSlice';
import ttsReducer from '../../tts/ttsSlice';

vi.mock('../repository', () => ({
  default: {
    getPagesByGeoLocation: vi.fn(async () => ({
      query: {
        pages: {
          1: { pageid: 1, title: 'First', coordinates: [{ lat: 1, lon: 2 }] },
          2: { pageid: 2, title: 'Second', coordinates: [{ lat: 1.1, lon: 2.1 }] }
        }
      }
    }))
  }
}));

import repository from '../repository';

describe('wikipediaSlice thunks and selectors', () => {
  const setupStore = () => configureStore({
    reducer: { wikipedia: wikipediaReducer, simdata: simdataReducer, tts: ttsReducer }
  });

  it('getPages adds pages and sets playing page', async () => {
    const store = setupStore();
    store.dispatch(updateData({ latitude: 1, longitude: 2 }));
    await store.dispatch(getPages(1, 2, 1000));
    const state = store.getState();
    expect(selectPagesWithDistances(state).length).toBe(2);
    expect(state.wikipedia.playingPageid).toBe(1);
    expect(repository.getPagesByGeoLocation).toHaveBeenCalled();
  });

  it('playNext rotates pages', () => {
    const store = setupStore();
    store.dispatch(receivePages({
      data: { query: { pages: {
        1: { pageid: 1, title: 'p1', coordinates: [{ lat: 0, lon: 0 }] },
        2: { pageid: 2, title: 'p2', coordinates: [{ lat: 0.1, lon: 0 }] }
      } } },
      searchPosition: [0,0],
      searchRadius: 100,
      searchTime: 0
    }));
    // first call starts playing first page
    store.dispatch(playNext());
    // second call marks page 1 as read and plays page 2
    store.dispatch(playNext());
    const state = store.getState();
    expect(state.wikipedia.pagesViewed).toContain(1);
    expect(state.wikipedia.playingPageid).toBe(2);
  });

  it('clearPagesOutOfRange removes pages behind player', () => {
    const store = setupStore();
    store.dispatch(setEdition('en'));
    store.dispatch(receivePages({
      data: { query: { pages: { 1: { pageid: 1, title: 'p1', coordinates: [{ lat: -0.5, lon: 0 }] } } } },
      searchPosition: [0,0],
      searchRadius: 100,
      searchTime: 0
    }));
    store.dispatch(updateCalculatedData({ position: [0,0], heading: 0, currentTime: 0 }));
    store.dispatch(clearPagesOutOfRange());
    const state = store.getState();
    expect(state.wikipedia.pages.length).toBe(0);
  });

  it('selectSearchCenterPoint uses simdata', () => {
    const store = setupStore();
    store.dispatch(updateData({ latitude: 1, longitude: 2, heading: 90, airspeed: 40 }));
    const state = store.getState();
    const point = selectSearchCenterPoint(state);
    expect(point.latitude).toBeCloseTo(1);
    expect(point.longitude).toBeCloseTo(2);
  });
});
