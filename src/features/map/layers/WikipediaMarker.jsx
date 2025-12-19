import * as React from 'react';
import { Marker } from "react-leaflet";
import { FaWikipediaW } from "react-icons/fa";
import styles from './WikipediaMarker.module.css';
import { useLeafletIcon } from './hooks';

export default React.memo(function WikipediaMarker({
  page
}) {
  const { pageid, coordinates } = page;

  const icon = <div className={styles.container}>
    <div className={styles.marker}>
      <FaWikipediaW size={32} />
    </div>
  </div>;

  const leafletIcon = useLeafletIcon(icon);

  return coordinates?.map((c, i) => <Marker
    key={`${pageid}-${i}`}
    position={c}
    icon={leafletIcon}
  />) ?? null;
});
