import reducer, { setIsFollowing } from '../mapSlice';

describe('mapSlice reducer', () => {
  it('handles setIsFollowing', () => {
    const initialState = undefined;
    const nextState = reducer(initialState, setIsFollowing(false));
    expect(nextState.isFollowing).toBe(false);
  });
});
