import * as React from 'react';
import { useCallback } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import parse from 'html-react-parser';

import styles from './Wikipedia.module.css';
import { selectCurrentPage, nextPage, selectVoice } from '../../wikipedia/wikipediaSlice';

function Extract({ page }) {
  return page.extract ? parse(page.extract) : null;
}

function Thumbnail({ page }) {
  return page?.thumbnail?.source
    ? <img src={page.thumbnail.source} alt={page.title} />
    : null;
}

export default function WikipediaPanel() {
  const dispatch = useDispatch();
  const page = useSelector(selectCurrentPage);
  
  const next = useCallback(() => {
    dispatch(nextPage());
  }, [dispatch]);

  if (!page) return null;

  return (
    <div className={styles.main}>
      <div className={styles.title}>
        <div>{page.title} <button onClick={next}>Next</button></div>
        <Thumbnail page={page} />
      </div>
      <div className={styles.text}>
        <Extract page={page} />
      </div>
    </div>
  );
}
