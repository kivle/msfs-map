import React from 'react';
import { useSelector } from 'react-redux';
import { selectEdition, selectPagesWithDistances } from '../wikipedia/wikipediaSlice';
import parse from 'html-react-parser';
import styles from './Sidebar.module.css';
import { formatDistance } from '../../utils/geo';
import { HiOutlineArrowNarrowUp } from 'react-icons/hi';

function Extract({ page }) {
  return page.extract ? parse(page.extract) : null;
}

function Thumbnail({ page }) {
  return page?.thumbnail?.source
    ? <img src={page.thumbnail.source} alt={page.title} />
    : null;
}

export default function Sidebar() {
  const edition = useSelector(selectEdition);
  const pages = useSelector(selectPagesWithDistances);

  return (
    <div className={styles.sidebar}>
      <div>
        {pages?.filter(p => p.closestPoint?.isInFront).map((page) => 
          <Page 
            key={page.pageid} 
            page={page}
            edition={edition}
          />)
        }
      </div>
    </div>
  );
}

const Page = React.memo(({ page, edition }) => {
  const closestPoint = page.closestPoint;

  return (
    <article className={styles.page}>
      <div className={styles.title}>
        <a href={`https://${edition}.wikipedia.org/?curid=${page.pageid}`} target="_blank" rel="noreferrer">
          {page.title}
        </a>
        <div className={styles.distance}>
          <HiOutlineArrowNarrowUp size={24} style={{transform: `rotate(${closestPoint?.headingDifference ?? 0}deg)`}} />
          <span>{formatDistance(closestPoint?.distance)}</span>
        </div>
        <Thumbnail page={page} />
      </div>
      <div className={styles.text}>
        <Extract page={page} />
      </div>
    </article>
  );
});
