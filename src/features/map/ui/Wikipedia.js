import * as React from 'react';
import { useCallback, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import parse from 'html-react-parser';
import striptags from 'striptags';
import { decode } from 'entities';

import styles from './Wikipedia.module.css';
import { selectCurrentPage, nextPage, selectVoice } from '../../wikipedia/wikipediaSlice';

function Extract({ page }) {
  return page.extract ? parse(page.extract) : null;
}

function Thumbnail({ page }) {
  return page?.thumbnail?.source
    ? <img src={page.thumbnail.source} alt={page.title} />
    : null;
}

export default function WikipediaPanel() {
  const dispatch = useDispatch();
  const page = useSelector(selectCurrentPage);
  const voice = useSelector(selectVoice);
  
  const next = useCallback(() => {
    dispatch(nextPage());
  }, [dispatch]);

  useEffect(
    () => {
      if (!page || !window.speechSynthesis) return;
      const text = `${page.title}\n\n${page.extract ? decode(striptags(page.extract)) : ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = window.speechSynthesis.getVoices().find(v => v.name === voice);
      utterance.onend = () => {
        next();
      };
      window.speechSynthesis.speak(utterance);
      return () => {
        utterance.onend = null;
        speechSynthesis.cancel();
      };
    },
    [page, next, voice]
  );

  if (!page) return null;

  return (
    <div className={styles.main}>
      <div className={styles.title}>
        <div>{page.title} <button onClick={next}>Next</button></div>
        <Thumbnail page={page} />
      </div>
      <div className={styles.text}>
        <Extract page={page} />
      </div>
    </div>
  );
}
