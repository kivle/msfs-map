import * as React from 'react';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import { useCallback } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import striptags from 'striptags';
import { decode } from 'entities';

import ML from '../../../../utils/ml';
import styles from './RateArticle.module.css';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { nextPage } from '../../../wikipedia/wikipediaSlice';

export default function RateArticle({
  page
}) {
  const dispatch = useDispatch();
  const [rated, setIsRated] = useState(false);
  const rating = useRef(undefined);
  const text = decode(striptags(page.extract));

  const reclassify = useCallback(async () => {
    rating.current = await ML.classify(text);
  }, [rating, text]);

  const next = useCallback(() => {
    dispatch(nextPage());
  }, [dispatch]);

  useEffect(() => {
    reclassify();
    return () => {
      rating.current = undefined;
      setIsRated(false);
    }
  }, [text, reclassify]);

  const rateDown = useCallback(() => {
    ML.add(text, 'bad');
    reclassify();
    setIsRated(true);
    next();
  }, [text, reclassify, next]);

  const rateUp = useCallback(() => {
    ML.add(text, 'good');
    reclassify();
    setIsRated(true);
  }, [text, reclassify]);

  return (
    <div className={styles.main}>
      <button
        disabled={rated} 
        className={rating.current === 'bad' ? styles.currentRating : ''}
        onClick={rateDown}><FaThumbsDown size="100%" /></button>
      <button 
        disabled={rated}
        className={rating.current === 'good' ? styles.currentRating : ''}
        onClick={rateUp}><FaThumbsUp size="100%" /></button>
    </div>
  );
}
