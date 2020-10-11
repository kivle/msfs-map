import * as React from "react";

import Marker from "react-leaflet-enhanced-marker";
import { useSelector } from "react-redux";
import { FaWikipediaW } from "react-icons/fa";

import { selectCurrentPage, selectPages } from "../../wikipedia/wikipediaSlice";

import styles from './Wikipedia.module.css';

export default function Wikipedia() {
  const currentPage = useSelector(selectCurrentPage);
  const pages = useSelector(selectPages);

  return (
    <>
      {pages.map(
        (p) =>
          p?.coordinates.map(c =>
            <Marker
              key={p.pageid}
              position={[c.lat, c.lon]}
              icon={
                  <FaWikipediaW
                      size={p.pageid === currentPage.pageid ? 64 : 32}
                      opacity={p.pageid === currentPage.pageid ? 1 : 0.8}
                      className={styles.marker}
                  />
              }
            />
          )
      )}
    </>
  );
}
