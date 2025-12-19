import * as React from 'react';
import { Marker } from "react-leaflet";
import { FaWikipediaW } from "react-icons/fa";
import styles from './WikipediaMarker.module.css';
import { useLeafletIcon } from './hooks';

export default React.memo(function WikipediaMarker({
  page,
  onClick
}) {
  const { pageid, coordinates, title } = page;

  const icon = <div className={styles.container}>
    <div className={styles.marker}>
      <FaWikipediaW aria-hidden="true" className={styles.logo} />
    </div>
    {title && (
      <div className={styles.label} title={title}>
        {title}
      </div>
    )}
  </div>;

  const leafletIcon = useLeafletIcon(icon, "100%", [220, 60]);

  const validCoords = (coordinates ?? []).filter(
    (c) => Array.isArray(c) && Number.isFinite(c[0]) && Number.isFinite(c[1])
  );

  return validCoords.map((c, i) => <Marker
    key={`${pageid}-${i}`}
    position={c}
    icon={leafletIcon}
    eventHandlers={onClick ? { click: onClick } : undefined}
  />) ?? null;
});
