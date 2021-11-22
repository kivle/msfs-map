import React from 'react';
import { useSelector } from 'react-redux';
import { selectPagesWithDistances } from '../wikipedia/wikipediaSlice';
import styles from './Sidebar.module.css';
import WikipediaPage from '../wikipedia/WikipediaPage/WikipediaPage';

export default function Sidebar() {
  const pages = useSelector(selectPagesWithDistances);
  const pagesNotInQueue = pages?.filter(p => !p.isInPlayQueue);
  const pagesToShow = pagesNotInQueue?.length > 20 ? pagesNotInQueue?.slice(0, 20) : pagesNotInQueue;

  return (
    <div className={styles.sidebar}>
      <div>
        {!pagesNotInQueue?.length && 
          <div>No pages found. Results will show up here as you fly around the world.</div>
        }
        {pagesToShow?.map((page) => 
          <div key={page.pageid} className={styles.pageContainer}>
            <WikipediaPage page={page} />
          </div>
        )}
      </div>
    </div>
  );
}
