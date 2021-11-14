import React, { useCallback } from 'react';
import { HiOutlineArrowNarrowUp } from 'react-icons/hi';
import { BiTrash } from 'react-icons/bi';
import { useWikipediaPageLink } from '../wikipedia/hooks';
import parse from 'html-react-parser';
import { formatDistance } from '../../utils/geo';
import styles from './WikipediaPage.module.css';
import { MdRecordVoiceOver } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { addToPlayQueue, markAsRead } from '../wikipedia/wikipediaSlice';

function Extract({ page }) {
  return page.extract ? parse(page.extract) : null;
}

function Thumbnail({ page }) {
  return page?.thumbnail?.source
    ? (
      <a href={page.thumbnail.source} target="_blank" rel="noopener noreferrer">
        <img src={page.thumbnail.source} alt={page.title} />
      </a>
    ) : null;
}

const WikipediaPage = React.memo(({ page }) => {
  const dispatch = useDispatch();
  const link = useWikipediaPageLink(page);
  
  const {
    distance, headingDifference
  } = page?.closestPoint ?? {};
  
  const {
    pageid
  } = page;
  
  const add = useCallback(() => {
    dispatch(addToPlayQueue({ pageid }));
  }, [dispatch, pageid]);
  
  const mark = useCallback(() => {
    dispatch(markAsRead({ pageid }));
  }, [dispatch, pageid]);

  return (
    <article className={styles.page}>
      <div className={styles.title}>
        <a href={link} target="_blank" rel="noreferrer">
          {page.title}
        </a>
        <div className={styles.distance}>
          <HiOutlineArrowNarrowUp
            size={24} 
            style={{transform: `rotate(${headingDifference ?? 0}deg)`}}
          />
          <span>{formatDistance(distance)}</span>
        </div>
        <Thumbnail page={page} />
      </div>
      <div className={styles.text}>
        <Extract page={page} />
      </div>
      <div className={styles.buttonBar}>
        <button type="button" onClick={add}><MdRecordVoiceOver size="100%" /></button>
        <button type="button" onClick={mark}><BiTrash size="100%" /></button>
      </div>
    </article>
  );
});

export default WikipediaPage;
