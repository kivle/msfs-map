import React, { useCallback } from 'react';
import { BiTrash } from 'react-icons/bi';
import { useWikipediaPageLink } from '../wikipedia/hooks';
import parse from 'html-react-parser';
import styles from './WikipediaPage.module.css';
import { MdRecordVoiceOver } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { addToPlayQueue, markAsRead } from '../wikipedia/wikipediaSlice';
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

const WikipediaPage = ({ page }) => {
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
        <a href={link} target="_blank" rel="noreferrer">
          {page.title}
        </a>
        <DistanceVisualizer page={page} />
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
};

export default React.memo(WikipediaPage);
