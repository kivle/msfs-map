import React from 'react';
import { useSelector } from 'react-redux';
import { selectEdition, selectPages } from '../wikipedia/wikipediaSlice';
import parse from 'html-react-parser';
import styles from './Sidebar.module.css';

function Extract({ page }) {
  return page.extract ? parse(page.extract) : null;
}

export default function Sidebar() {
  const edition = useSelector(selectEdition);
  const pages = useSelector(selectPages);

  return (
    <div className={styles.sidebar}>
      <h2>Wikipedia</h2>
      <div>
        {pages.map((page) => (
          <article className={styles.page}>
            <div className={styles.title}>
              <a href={`https://${edition}.wikipedia.org/?curid=${page.pageid}`} target="_blank" rel="noreferrer">
                {page.title}
              </a>
            </div>
            <div className={styles.text}>
              <Extract page={page} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
