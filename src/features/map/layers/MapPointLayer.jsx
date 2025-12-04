import React, { useMemo } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { FaPlaneDeparture, FaBuilding, FaTree, FaMountain, FaMapMarkerAlt, FaHelicopter, FaShip } from 'react-icons/fa';
import { MdLocationCity, MdTerrain } from 'react-icons/md';
import { GiLighthouse } from 'react-icons/gi';
import { useGeoJson } from './useGeoJson';

// Unified mapping from Type -> icon component so layers render consistently.
const typeIconMap = {
  Airport: FaPlaneDeparture,
  Building: FaBuilding,
  Helipad: FaHelicopter,
  Landform: MdTerrain,
  Lighthouse: GiLighthouse,
  Mountain: FaMountain,
  Park: FaTree,
  POI: FaMapMarkerAlt,
  Seaport: FaShip,
  Settlement: MdLocationCity
};

// Layer-level fallback types when a feature lacks a Type value.
const layerDefaultType = {
  coreAirports: 'Airport',
  photogammetry: 'Settlement'
};

function formatLatLng(latlng) {
  if (!latlng) return null;
  const { lat, lng } = latlng;
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) return null;

  const latValue = lat.toFixed(5);
  const lngValue = lng.toFixed(5);

  return {
    text: `${latValue}, ${lngValue}`,
    query: `${latValue},${lngValue}`,
    path: `${latValue}/${lngValue}`
  };
}

function buildTooltip(feature, fallbackLabel, latlng, type) {
  const properties = feature?.properties ?? {};
  const name = properties.Name || properties.Title || fallbackLabel;
  const ident = (properties.Ident || '').toString().trim() || undefined;
  const description = properties.Description;

  const coords = formatLatLng(latlng);
  const label = [name, ident].filter(Boolean).join(' • ') || fallbackLabel;
  const googleMapsUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords.query)}`
    : null;
  const openAirportMapUrl = coords && type === 'Airport' && ident
    ? `https://openairportmap.org/${encodeURIComponent(ident)}#map=14/${coords.path}`
    : null;

  const links = [
    googleMapsUrl && { label: 'Open in Google Maps', href: googleMapsUrl },
    openAirportMapUrl && { label: 'Open in OpenAirportMap', href: openAirportMapUrl }
  ].filter(Boolean);

  const tooltipContent = (
    <div>
      {label && <div><strong>{label}</strong></div>}
      {description && <div>{description}</div>}
      {coords && (
        <div>
          {coords.text}
        </div>
      )}
      {links.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <div>External maps:</div>
          <ul style={{ paddingLeft: 18, margin: '4px 0' }}>
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return renderToStaticMarkup(tooltipContent);
}

export default function MapPointLayer({ layer }) {
  const { data } = useGeoJson(layer.url, layer.fallbackUrl);
  const layerDefault = layerDefaultType[layer.id];

  const pointToLayer = useMemo(() => {
    const createIconMarker = (latlng, IconComponent) => {
      const html = renderToStaticMarkup(
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            filter: 'drop-shadow(0 0 2px white) drop-shadow(0 0 1px white)',
          }}
        >
          <IconComponent size={20} color={layer.color} />
        </div>
      );

      return L.marker(latlng, {
        icon: L.divIcon({
          html,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      });
    };

    return (feature, latlng) => {
      const type = feature?.properties?.Type || layerDefault;
      const IconComponent = type ? typeIconMap[type] : undefined;

      if (IconComponent) {
        return createIconMarker(latlng, IconComponent);
      }

      // Fallback: render as a simple dot if no icon is mapped for this Type.
      return L.circleMarker(latlng, {
        radius: 5,
        color: layer.color,
        weight: 1,
        fillColor: layer.color,
        fillOpacity: 0.9
      });
    };
  }, [layer.color, layerDefault]);

  const onEachFeature = useMemo(() => (feature, leafletLayer) => {
    const type = feature?.properties?.Type || layerDefault;
    const latlng = typeof leafletLayer.getLatLng === 'function'
      ? leafletLayer.getLatLng()
      : (feature?.geometry?.coordinates?.length >= 2
        ? { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] }
        : null);

    const tooltip = buildTooltip(feature, layer.label, latlng, type);
    if (tooltip) {
      leafletLayer.bindPopup(tooltip, {
        autoClose: true,
        closeButton: true,
        closeOnClick: true,
        maxWidth: 320,
        className: 'poi-popup'
      });
    }
  }, [layer.label]);

  if (!data) return null;

  return (
    <GeoJSON
      key={layer.id}
      data={data}
      pointToLayer={pointToLayer}
      onEachFeature={onEachFeature}
    />
  );
}
