import * as React from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { useCallback } from 'react';
import styles from './RateArticle.module.css';
import { useDispatch } from 'react-redux';
import { ratePage } from '../../../wikipedia/wikipediaSlice';

export default React.memo(function RateArticle({
  page
}) {
  const dispatch = useDispatch();

  const rateDown = useCallback(() => {
    dispatch(ratePage(page.pageid, 'bad'));
  }, [dispatch, page]);

  const rateUp = useCallback(() => {
    dispatch(ratePage(page.pageid, 'good'));
  }, [dispatch, page]);

  return (
    <div className={styles.main}>
      <button
        disabled={page.userRated} 
        className={page.rating === 'bad' ? styles.currentRating : ''}
        onClick={rateDown}><FaThumbsDown size="100%" /></button>
      <button 
        disabled={page.userRated}
        className={page.rating === 'good' ? styles.currentRating : ''}
        onClick={rateUp}><FaThumbsUp size="100%" /></button>
    </div>
  );
});
