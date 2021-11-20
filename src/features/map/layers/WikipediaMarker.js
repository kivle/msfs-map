import * as React from 'react';
import Marker from "react-leaflet-enhanced-marker";
import { FaWikipediaW } from "react-icons/fa";
import { MdRecordVoiceOver } from 'react-icons/md';
import styles from './WikipediaMarker.module.css';

function WikipediaIcon({ isReading }) {
  return (
    <>
      {!isReading && <FaWikipediaW size={32} />}
      {isReading &&
        <MdRecordVoiceOver 
          className={styles.speaker}
          size={32} 
          stroke="black"
          strokeWidth={1}
          color="#FFF" 
        />
      }
    </>
  );
};

export default React.memo(function WikipediaMarker({
  page, isCurrentPage, isPlaying
}) {
  const { pageid, coordinates, isInPlayQueue } = page;
  let cn = styles.marker;
  if (isCurrentPage) {
    cn += ` ${styles.current}`;
  }
  else if (isInPlayQueue) {
    cn += ` ${styles.queued}`;
  }

  return coordinates?.map((c, i) => <Marker
    key={`${pageid}-${i}`}
    position={c}
    icon={
      <div className={styles.container}>
        <div className={cn}>
          <WikipediaIcon 
            isReading={isPlaying && isCurrentPage}
          />
        </div>
      </div>
    }
  />) ?? null;
});
