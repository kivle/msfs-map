import React, { useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaPlaneDeparture, FaBuilding, FaTree, FaMountain, FaMapMarkerAlt, FaHelicopter, FaShip } from 'react-icons/fa';
import { MdLocationCity, MdTerrain } from 'react-icons/md';
import { GiLighthouse } from 'react-icons/gi';
import { GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { useSelector } from 'react-redux';
import { mapLayerDefinitions, defaultMapLayerVisibility } from '../mapLayers';
import { selectMapLayerVisibility } from '../mapSlice';

const ensureTrailingSlash = (value) => value.endsWith('/') ? value : `${value}/`;
const baseUrl = ensureTrailingSlash(import.meta?.env?.BASE_URL ?? '/');

const geojsonCache = new Map();

const cityIcons = {
  Airport: FaPlaneDeparture,
  Building: FaBuilding,
  Landform: MdTerrain,
  Park: FaTree,
  Settlement: MdLocationCity
};
const poiIcons = {
  Building: FaBuilding,
  Landform: MdTerrain,
  Lighthouse: GiLighthouse,
  Mountain: FaMountain
};
const worldUpdateIcons = {
  Airport: FaPlaneDeparture,
  Building: FaBuilding,
  Helipad: FaHelicopter,
  Landform: MdTerrain,
  Lighthouse: GiLighthouse,
  Mountain: FaMountain,
  POI: FaMapMarkerAlt,
  Park: FaTree,
  Seaport: FaShip,
  Settlement: MdLocationCity
};

function useGeoJson(url, fallbackUrl) {
  const initial = url ? geojsonCache.get(url) : null;
  const [data, setData] = useState(() => initial);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;

    async function load() {
      if (geojsonCache.has(url)) {
        setData(geojsonCache.get(url));
        return;
      }
      try {
        let resp = await fetch(url);
        if (!resp.ok && fallbackUrl) {
          resp = await fetch(fallbackUrl);
        }
        if (!resp.ok) throw new Error(`Failed to load ${url} (${resp.status})`);
        const json = await resp.json();
        geojsonCache.set(url, json);
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err);
        console.warn('Failed to load map layer', url, err);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [url]);

  return { data, error };
}

function buildTooltip(feature, fallbackLabel) {
  const properties = feature?.properties ?? {};
  const name = properties.Name || properties.Title || fallbackLabel;
  const ident = properties.Ident;
  const description = properties.Description;
  return [name, ident, description].filter(Boolean).join(' • ');
}

function MapPointLayer({ layer }) {
  const { data } = useGeoJson(layer.url, layer.fallbackUrl);
  const isCityUpdates = layer.id === 'cityUpdates';
  const isAirportLayer = layer.id === 'coreAirports';
  const isPhotogammetry = layer.id === 'photogammetry';
  const isPoiLayer = layer.id === 'corePois';
  const isWorldUpdates = layer.id === 'worldUpdates';

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

    if (isCityUpdates) {
      return (feature, latlng) => {
        const type = feature?.properties?.Type;
        const IconComponent = cityIcons[type] || MdLocationCity;
        return createIconMarker(latlng, IconComponent);
      };
    }
    if (isAirportLayer) {
      return (_, latlng) => createIconMarker(latlng, FaPlaneDeparture);
    }
    if (isPhotogammetry) {
      return (_, latlng) => createIconMarker(latlng, MdLocationCity);
    }
    if (isPoiLayer) {
      return (feature, latlng) => {
        const type = feature?.properties?.Type;
        const IconComponent = poiIcons[type] || MdLocationCity;
        return createIconMarker(latlng, IconComponent);
      };
    }
    if (isWorldUpdates) {
      return (feature, latlng) => {
        const type = feature?.properties?.Type;
        const IconComponent = worldUpdateIcons[type] || MdLocationCity;
        return createIconMarker(latlng, IconComponent);
      };
    }
    return (feature, latlng) => L.circleMarker(latlng, {
      radius: 5,
      color: layer.color,
      weight: 1,
      fillColor: layer.color,
      fillOpacity: 0.9
    });
  }, [isAirportLayer, isCityUpdates, isPhotogammetry, isPoiLayer, isWorldUpdates, layer.color]);

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

export default function PointLayers() {
  const visibility = useSelector(selectMapLayerVisibility);
  const resolvedVisibility = useMemo(() => ({
    ...defaultMapLayerVisibility,
    ...(visibility ?? {})
  }), [visibility]);

  const layerSources = useMemo(() => mapLayerDefinitions.map((layer) => ({
    ...layer,
    url: new URL(layer.fileName, `${window.location.origin}${baseUrl}`).toString(),
    fallbackUrl: baseUrl !== '/'
      ? new URL(layer.fileName, window.location.origin).toString()
      : null
  })), []);

  return layerSources
    .filter((layer) => resolvedVisibility[layer.id])
    .map((layer) => <MapPointLayer key={layer.id} layer={layer} />);
}
