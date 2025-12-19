import React from 'react';
import { useSelector } from 'react-redux';
import { selectPagesWithDistances } from '../wikipedia/wikipediaSelectors';
import styles from './Sidebar.module.css';
import WikipediaPage from '../wikipedia/WikipediaPage/WikipediaPage';

export default function Sidebar() {
  const pages = useSelector(selectPagesWithDistances);
  const pagesToShow = pages?.length > 20 ? pages?.slice(0, 20) : pages;

  return (
    <div className={styles.sidebar}>
      <div>
        {!pages?.length && 
          <div className={styles.status}>No pages found. Results will show up here as you fly around the world.</div>
        }
        {!!pages?.length &&
          <div className={styles.status}>{pages?.length} pages found.</div>
        }
        {pagesToShow?.map(({ page, closestPoint }) => 
          <div key={page.pageid} className={styles.pageContainer}>
            <WikipediaPage 
              page={page} 
              closestPoint={closestPoint}
            />
          </div>
        )}
      </div>
    </div>
  );
}
