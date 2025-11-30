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

function buildTooltip(feature, fallbackLabel) {
  const properties = feature?.properties ?? {};
  const name = properties.Name || properties.Title || fallbackLabel;
  const ident = properties.Ident;
  const description = properties.Description;
  return [name, ident, description].filter(Boolean).join(' • ');
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
    const tooltip = buildTooltip(feature, layer.label);
    if (tooltip) {
      leafletLayer.bindTooltip(tooltip, {
        direction: 'top',
        offset: [0, -6],
        opacity: 0.9
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
