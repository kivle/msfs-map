import React from 'react';
import { useSelector } from 'react-redux';
import { selectPagesWithDistances } from '../wikipedia/wikipediaSlice';
import styles from './Sidebar.module.css';
import TtsPlayer from '../tts/TtsPlayer/TtsPlayer';
import WikipediaPage from '../wikipedia/WikipediaPage/WikipediaPage';

export default function Sidebar() {
  const pages = useSelector(selectPagesWithDistances);

  return (
    <div className={styles.sidebar}>
      <TtsPlayer />
      <div>
        {pages?.filter(p => !p.isInPlayQueue).map((page) => 
          <WikipediaPage
            key={page.pageid} 
            page={page}
          />)
        }
      </div>
    </div>
  );
}
