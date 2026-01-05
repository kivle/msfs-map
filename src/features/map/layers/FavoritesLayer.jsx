import React, { useMemo } from 'react';
import { Marker, Tooltip, useMapEvents } from 'react-leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { FaStar } from 'react-icons/fa';
import styles from './FavoritesLayer.module.css';

export default function FavoritesLayer({
  favorites,
  enabled,
  canAdd,
  onRequestAdd,
  onSelect,
  color
}) {
  useMapEvents({
    click: (event) => {
      if (!canAdd) return;
      const { lat, lng } = event.latlng ?? {};
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      onRequestAdd?.({ lat, lng });
    }
  });

  const icon = useMemo(() => {
    const html = `<div class="${styles.icon}">${renderToStaticMarkup(
      <FaStar color={color} size={16} />
    )}</div>`;
    return L.divIcon({
      html,
      className: styles.marker,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
  }, [color]);

  if (!enabled) return null;

  return favorites.map((favorite) => (
    <Marker
      key={favorite.id}
      position={[favorite.lat, favorite.lng]}
      icon={icon}
      eventHandlers={{
        click: (event) => {
          event?.originalEvent?.stopPropagation?.();
          onSelect?.(favorite);
        }
      }}
    >
      <Tooltip
        direction="top"
        offset={[0, -14]}
        opacity={0.95}
        permanent
        className={styles.tooltip}
      >
        {favorite.name}
      </Tooltip>
    </Marker>
  ));
}
