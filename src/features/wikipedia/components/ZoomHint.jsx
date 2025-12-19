import React from 'react';
import { useSelector } from 'react-redux';
import { selectNeedsMoreZoom } from '../wikipediaSelectors';
import styles from './ZoomHint.module.css';

export default function ZoomHint() {
  const needsMoreZoom = useSelector(selectNeedsMoreZoom);
  if (!needsMoreZoom) return null;
  return (
    <div className={styles.hint}>
      Zoom in to load nearby Wikipedia articles.
    </div>
  );
}
