import * as React from "react";

import Marker from "react-leaflet-enhanced-marker";
import { useSelector } from "react-redux";
import { FaBookReader, FaWikipediaW } from "react-icons/fa";
import { MdRecordVoiceOver } from 'react-icons/md';

import { selectCurrentPage, selectIsPlaying, selectPages } from "../../wikipedia/wikipediaSlice";

import styles from './Wikipedia.module.css';

export default React.memo(function Wikipedia() {
  const currentPage = useSelector(selectCurrentPage);
  const isPlaying = useSelector(selectIsPlaying);
  const pages = useSelector(selectPages);

  return (
    <>
      {pages?.map(
        (p) =>
          p?.coordinates.map(c =>
            <Marker
              key={p.pageid}
              position={[c.lat, c.lon]}
              icon={
                <div className={`${styles.marker}${p.pageid === currentPage.pageid ? ` ${styles.current}` : ''}${p.rating === 'bad' ? ` ${styles.ratedBad}` : ''}`}>
                  <WikipediaIcon 
                    isReading={isPlaying && p.pageid === currentPage.pageid}
                    tts={p.rating === 'good'} />
                </div>
              }
            />
          )
      )}
    </>
  );
});

function WikipediaIcon({ isReading, tts }) {
  return (
    <>
      {!isReading && <FaWikipediaW size={32} />}
      {isReading && tts &&
        <MdRecordVoiceOver 
          className={styles.speaker}
          size={32} 
          stroke="black"
          strokeWidth={1}
          color="#FFF" 
        />}
      {isReading && !tts &&
        <FaBookReader
          className={styles.speaker}
          size={30}
        />
      }
    </>
  );
};
