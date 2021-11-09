import * as React from 'react';
import Marker from "react-leaflet-enhanced-marker";
import { FaBookReader, FaWikipediaW } from "react-icons/fa";
import { MdRecordVoiceOver } from 'react-icons/md';
import styles from './WikipediaMarker.module.css';

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

export default React.memo(function WikipediaMarker({
  page, isCurrentPage, isPlaying
}) {
  const { pageid, rating, coordinates } = page;
  let cn = styles.marker;
  if (isCurrentPage) {
    cn += ` ${styles.current}`;
  }
  if (rating === 'bad') {
    cn += ` ${styles.ratedBad}`;
  }

  return coordinates?.map((c, i) => <Marker
    key={`${pageid}-${i}`}
    position={c}
    icon={
      <div className={styles.container}>
        <div className={cn}>
          <WikipediaIcon 
            isReading={isPlaying && isCurrentPage}
            tts={rating === 'good'} />
        </div>
      </div>
    }
  />) ?? null;
});
