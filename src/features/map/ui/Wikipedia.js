import * as React from 'react';

import { FaCity } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import parse from 'html-react-parser';

import styles from './Wikipedia.module.css';
import { selectPages } from '../../wikipedia/wikipediaSlice';

function Extract({ page }) {
  return parse(page.extract);
}

function Thumbnail({ page }) {
  return page?.thumbnail?.source
    ? <img src={page.thumbnail.source} alt={page.title} />
    : null;
}

export default function WikipediaPanel() {
  const pages = useSelector(selectPages);

  if (!pages.length) return null;

  return (
    <div className={styles.main}>
      <div className={styles.title}>
        {pages[0].title}
        <Thumbnail page={pages[0]} />
      </div>
      <div className={styles.text}>
        <Extract page={pages[0]} />
      </div>
    </div>
  );
}
