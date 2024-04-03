import * as React from 'react';
import { Marker } from "react-leaflet";
import { FaWikipediaW } from "react-icons/fa";
import { MdRecordVoiceOver } from 'react-icons/md';
import styles from './WikipediaMarker.module.css';
import { useLeafletIcon } from './hooks';

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
  const { pageid, coordinates } = page;
  let cn = styles.marker;
  if (isCurrentPage) {
    cn += ` ${styles.current}`;
  }

  const icon = <div className={styles.container}>
    <div className={cn}>
      <WikipediaIcon 
        isReading={isPlaying && isCurrentPage}
      />
    </div>
  </div>;

  const leafletIcon = useLeafletIcon(icon);

  return coordinates?.map((c, i) => <Marker
    key={`${pageid}-${i}`}
    position={c}
    icon={leafletIcon}
  />) ?? null;
});
