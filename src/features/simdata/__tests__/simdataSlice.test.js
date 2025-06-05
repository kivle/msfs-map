import reducer, { updateData, setConnected, setWebsocketUrl } from '../simdataSlice';

describe('simdataSlice reducer', () => {
  it('updates position and parameters', () => {
    const state = reducer(undefined, updateData({ latitude: 1, longitude: 2, altitude: 1000 }));
    expect(state.position).toEqual([1,2]);
    expect(state.altitude).toBe(1000);
  });

  it('sets websocket url', () => {
    const state = reducer(undefined, setWebsocketUrl('ws://example'));
    expect(state.websocketUrl).toBe('ws://example');
  });

  it('changes connection status', () => {
    const state = reducer(undefined, setConnected(true));
    expect(state.connected).toBe(true);
  });
});
