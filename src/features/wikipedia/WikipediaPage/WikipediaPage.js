import React, { useCallback } from 'react';
import { BiTrash } from 'react-icons/bi';
import { useWikipediaPageLink } from '../hooks';
import parse from 'html-react-parser';
import styles from './WikipediaPage.module.css';
import { MdRecordVoiceOver } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { addToPlayQueue, markAsRead } from '../wikipediaSlice';
import DistanceVisualizer from './DistanceVisualizer';

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

const WikipediaPage = ({ page, closestPoint, isInPlayQueue }) => {
  const dispatch = useDispatch();
  const link = useWikipediaPageLink(page);

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
        {page.isReading && <MdRecordVoiceOver 
          className={styles.speaker}
          size={32} 
          stroke="black"
          strokeWidth={1}
          color="#FFF" 
        />}
        <a href={link} target="_blank" rel="noreferrer">
          {page.title}
        </a>
        <DistanceVisualizer point={closestPoint} />
        <Thumbnail page={page} />
      </div>
      <div className={styles.text}>
        <Extract page={page} />
      </div>
      {!isInPlayQueue && <div className={styles.buttonBar}>
        <button type="button" onClick={add}><MdRecordVoiceOver size="100%" /></button>
        <button type="button" onClick={mark}><BiTrash size="100%" /></button>
      </div>}
    </article>
  );
};

export default React.memo(WikipediaPage);
