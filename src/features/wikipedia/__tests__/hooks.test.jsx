import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import wikipediaReducer, { setEdition } from '../wikipediaSlice';
import { useWikipediaPageLink } from '../hooks';

describe('useWikipediaPageLink', () => {
  it('returns page link using edition from store', () => {
    const store = configureStore({ reducer: { wikipedia: wikipediaReducer } });
    store.dispatch(setEdition('es'));
    const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
    const { result } = renderHook(() => useWikipediaPageLink({ pageid: 123 }), { wrapper });
    expect(result.current).toBe('https://es.wikipedia.org/?curid=123');
  });
});
