import React from 'react';
import WikipediaPage from './WikipediaPage/WikipediaPage';
import styles from './WikipediaDetailPanel.module.css';
import { useWikipediaPageLink } from './hooks';

export default function WikipediaDetailPanel({
  page,
  isLoading,
  onClose
}) {
  if (!page && !isLoading) return null;

  const stopScrollPropagation = (e) => {
    e.stopPropagation();
  };
  const stopDragPropagation = (e) => {
    e.stopPropagation();
  };

  const link = useWikipediaPageLink(page);

  return (
    <div
      className={styles.panel}
      onWheelCapture={stopScrollPropagation}
      onMouseDownCapture={stopDragPropagation}
    >
      <div className={styles.header}>
        {page?.title ? (
          <a className={styles.title} href={link} target="_blank" rel="noreferrer">
            {page.title}
          </a>
        ) : (
          <span className={styles.title}>Wikipedia article</span>
        )}
        <button type="button" onClick={onClose} aria-label="Close">X</button>
      </div>
      {isLoading && (
        <div className={styles.loading}>
          <span className={styles.spinner} aria-hidden="true" />
          <span>Loading…</span>
        </div>
      )}
      {page && (
        <div className={styles.body}>
          <WikipediaPage page={page} />
        </div>
      )}
    </div>
  );
}
