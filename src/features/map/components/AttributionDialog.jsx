import * as React from 'react';
import styles from './AttributionDialog.module.css';

export default function AttributionDialog({ version, mapAttribution, onClose }) {
  const baseCredits = [
    { label: 'Leaflet', href: 'https://leafletjs.com/' },
    { label: 'react-leaflet', href: 'https://react-leaflet.js.org/' },
    { label: 'leaflet-providers', href: 'https://github.com/leaflet-extras/leaflet-providers' },
    { label: 'MapLibre GL JS', href: 'https://maplibre.org/' },
    { label: 'maplibre-gl-leaflet', href: 'https://github.com/maplibre/maplibre-gl-leaflet' },
    { label: 'react-icons', href: 'https://react-icons.github.io/react-icons/' }
  ];

  const dataCredits = [
    { label: 'Wikipedia', href: 'https://en.wikipedia.org', prefix: '\u00a9' },
    { label: 'Timwintle1979\'s POI DB', href: 'https://flightsim.to/file/81114/littlenavmap-msfs-poi-s' },
    { label: 'mwgg Airports', href: 'https://github.com/mwgg/Airports' }
  ];

  const handleBackdropClick = () => {
    onClose?.();
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" onClick={handleBackdropClick}>
      <div className={styles.dialog} onClick={stopPropagation}>
        <div className={styles.header}>
          <h2>Map credits</h2>
          <button type="button" onClick={onClose} className={styles.closeButton}>Close</button>
        </div>
        <div className={styles.content}>
          <section className={styles.section}>
            <h3>Basemap & tiles</h3>
            <div
              className={styles.htmlAttribution}
              dangerouslySetInnerHTML={{ __html: mapAttribution || 'Unavailable' }}
            />
          </section>

          <section className={styles.section}>
            <h3>Data sources</h3>
            <ul className={styles.list}>
              {dataCredits.map((credit) => (
                <li key={credit.href}>
                  {credit.prefix ? `${credit.prefix} ` : ''}
                  <a href={credit.href} target="_blank" rel="noreferrer">{credit.label}</a>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h3>Libraries & app</h3>
            <ul className={styles.list}>
              {baseCredits.map((credit) => (
                <li key={credit.href}>
                  <a href={credit.href} target="_blank" rel="noreferrer">{credit.label}</a>
                </li>
              ))}
              <li>&copy; <a href="https://github.com/kivle/msfs-map" target="_blank" rel="noreferrer">MSFS-map</a> v{version}</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
