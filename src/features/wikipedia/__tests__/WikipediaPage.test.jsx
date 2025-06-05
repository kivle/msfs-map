import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import wikipediaReducer, { setEdition } from '../wikipediaSlice';
import WikipediaPage from '../WikipediaPage/WikipediaPage';

vi.mock('../hooks', async () => {
  const actual = await vi.importActual('../hooks');
  return {
    ...actual,
    useWikipediaPageLink: () => 'https://en.wikipedia.org/?curid=1'
  };
});

describe('WikipediaPage component', () => {
  it('dispatches markAsRead when delete button clicked', () => {
    const store = configureStore({ reducer: { wikipedia: wikipediaReducer } });
    const page = { pageid: 1, title: 'Test Page', extract: 'Intro' };
    const { getByRole } = render(
      <Provider store={store}>
        <WikipediaPage page={page} closestPoint={{ distance: 10, headingDifference: 0 }} />
      </Provider>
    );
    fireEvent.click(getByRole('button'));
    expect(store.getState().wikipedia.pagesViewed).toContain(1);
  });

  it('uses edition for link', () => {
    const store = configureStore({ reducer: { wikipedia: wikipediaReducer } });
    store.dispatch(setEdition('fr'));
    const page = { pageid: 1, title: 'Page' };
    const { getByText } = render(
      <Provider store={store}>
        <WikipediaPage page={page} closestPoint={{ distance: 10, headingDifference: 0 }} />
      </Provider>
    );
    expect(getByText('Page').closest('a').href).toBe('https://en.wikipedia.org/?curid=1');
  });
});
