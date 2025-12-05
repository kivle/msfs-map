import React, { useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaPlaneDeparture, FaBuilding, FaTree, FaMountain, FaMapMarkerAlt, FaHelicopter, FaShip, FaGlobeAmericas } from 'react-icons/fa';
import { MdLocationCity, MdTerrain } from 'react-icons/md';
import { GiLighthouse } from 'react-icons/gi';
import { useGeoJson } from './useGeoJson';
import { useTiledGeoJson } from './useTiledGeoJson';

// Unified mapping from Type -> icon component so layers render consistently.
const typeIconMap = {
  Airport: FaPlaneDeparture,
  Building: FaBuilding,
  Helipad: FaHelicopter,
  Landform: MdTerrain,
  Lighthouse: GiLighthouse,
  Mountain: FaMountain,
  Park: FaTree,
  GlobalAirport: FaGlobeAmericas,
  POI: FaMapMarkerAlt,
  Seaport: FaShip,
  Settlement: MdLocationCity
};

// Layer-level fallback types when a feature lacks a Type value.
const layerDefaultType = {
  coreAirports: 'Airport',
  globalAirports: 'GlobalAirport',
  photogammetry: 'Settlement'
};

const rasterIconCache = new Map();
const rasterIconPromises = new Map();

async function renderSvgToPngIcon(IconComponent, color) {
  const size = 22;
  const svgMarkup = renderToStaticMarkup(<IconComponent size={size} color={color} />);
  const withNs = svgMarkup.includes('xmlns')
    ? svgMarkup
    : svgMarkup.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
  const blob = new Blob([withNs], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image(size, size);
    img.src = url;
    await (img.decode ? img.decode() : new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    }));
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    const pngUrl = canvas.toDataURL('image/png');
    return L.icon({
      iconUrl: pngUrl,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function ensureRasterIcon(type, color, IconComponent, notifyReady) {
  if (!IconComponent) return null;
  const key = `${type || 'unknown'}:${color}`;
  if (rasterIconCache.has(key)) return rasterIconCache.get(key);
  if (!rasterIconPromises.has(key)) {
    const promise = renderSvgToPngIcon(IconComponent, color)
      .then((icon) => {
        rasterIconCache.set(key, icon);
        rasterIconPromises.delete(key);
        if (typeof notifyReady === 'function') notifyReady();
        return icon;
      })
      .catch(() => {
        rasterIconPromises.delete(key);
      });
    rasterIconPromises.set(key, promise);
  }
  return null;
}

function clusterFeatures(features, cellSizeDegrees) {
  const buckets = new Map();
  const size = cellSizeDegrees || 1;
  features.forEach((feature) => {
    const [lon, lat] = feature.geometry?.coordinates ?? [];
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    const latBucket = Math.floor(lat / size) * size;
    const lonBucket = Math.floor(lon / size) * size;
    const key = `${latBucket}:${lonBucket}`;
    if (!buckets.has(key)) {
      buckets.set(key, { latSum: 0, lonSum: 0, count: 0, sample: feature });
    }
    const bucket = buckets.get(key);
    bucket.latSum += lat;
    bucket.lonSum += lon;
    bucket.count += 1;
  });

  const clustered = [];
  buckets.forEach(({ latSum, lonSum, count, sample }, key) => {
    const [latKey, lonKey] = key.split(':').map(parseFloat);
    const lat = latSum / count;
    const lon = lonSum / count;
    clustered.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      properties: {
        Name: `${count} locations`,
        Count: count,
        Cluster: true,
        ClusterCell: { latKey, lonKey, size },
        Type: sample?.properties?.Type ?? 'Cluster'
      }
    });
  });

  return clustered;
}

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
  const openAirportMapUrl = coords && ['Airport', 'GlobalAirport'].includes(type) && ident
    ? `https://openairportmap.org/${encodeURIComponent(ident)}#map=14/${coords.path}`
    : null;

  const links = [
    googleMapsUrl && { label: 'Open in Google Maps', href: googleMapsUrl },
    openAirportMapUrl && { label: 'Open in OpenAirportMap', href: openAirportMapUrl }
  ].filter(Boolean);

  const metadata = [
    ident && { label: 'ICAO', value: ident },
    properties.Iata && { label: 'IATA', value: properties.Iata },
    (properties.City || properties.State) && { label: 'Location', value: [properties.City, properties.State].filter(Boolean).join(', ') },
    properties.Country && { label: 'Country', value: properties.Country },
    properties.ElevationFt !== undefined && properties.ElevationFt !== null && properties.ElevationFt !== ''
      ? { label: 'Elevation', value: `${properties.ElevationFt} ft` }
      : null,
    properties.Timezone && { label: 'Timezone', value: properties.Timezone }
  ].filter(Boolean);

  const tooltipContent = (
    <div>
      {label && <div><strong>{label}</strong></div>}
      {description && <div>{description}</div>}
      {metadata.length > 0 && (
        <ul style={{ paddingLeft: 18, margin: '6px 0' }}>
          {metadata.map((meta) => (
            <li key={`${meta.label}-${meta.value}`}>
              <strong>{meta.label}:</strong> {meta.value}
            </li>
          ))}
        </ul>
      )}
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
  const loader = layer.tiled ? useTiledGeoJson : useGeoJson;
  const { data } = loader(layer.url, layer.fallbackUrl, layer.minZoom);
  const map = useMap();
  const [mapZoom, setMapZoom] = useState(() => map?.getZoom?.());
  useEffect(() => {
    if (!map) return undefined;
    const handle = () => setMapZoom(map.getZoom());
    map.on('zoomend', handle);
    handle();
    return () => map.off('zoomend', handle);
  }, [map]);
  const layerDefault = layerDefaultType[layer.id];

  const dense = layer.dense;
  const useCanvas = layer.useCanvas;
  const clusterBelowZoom = layer.clusterBelowZoom;
  const clusterCellSizeDegrees = layer.clusterCellSizeDegrees;
  const [iconVersion, setIconVersion] = useState(0);

  const effectiveFeatures = useMemo(() => {
    if (!data?.features) return null;
    if (clusterBelowZoom && mapZoom !== undefined && mapZoom < clusterBelowZoom) {
      return clusterFeatures(data.features, clusterCellSizeDegrees);
    }
    return data.features;
  }, [data, clusterBelowZoom, clusterCellSizeDegrees, mapZoom]);

  const renderer = useMemo(() => (useCanvas ? L.canvas({ padding: 0.5 }) : undefined), [useCanvas]);

  // Pre-request raster icons for types present in the current features
  useEffect(() => {
    if (!effectiveFeatures) return;
    const types = new Set();
    effectiveFeatures.forEach((f) => {
      const t = f?.properties?.Type || layerDefault;
      if (t) types.add(t);
    });
    types.forEach((t) => {
      const IconComponent = typeIconMap[t];
      ensureRasterIcon(t, layer.color, IconComponent, () => setIconVersion((v) => v + 1));
    });
  }, [effectiveFeatures, layer.color, layerDefault]);

  const pointToLayer = useMemo(() => {
    const createIconMarker = (latlng, IconComponent) => {
      const typeKey = IconComponent?.displayName ?? 'icon';
      const rasterIcon = ensureRasterIcon(typeKey, layer.color, IconComponent, () => setIconVersion((v) => v + 1));
      if (rasterIcon) {
        return L.marker(latlng, { icon: rasterIcon });
      }
      return L.circleMarker(latlng, {
        radius: dense ? 4 : 5,
        color: layer.color,
        weight: 1,
        fillColor: layer.color,
        fillOpacity: 0.9
      });
    };

    return (feature, latlng) => {
      const type = feature?.properties?.Cluster ? 'Cluster' : (feature?.properties?.Type || layerDefault);
      const isCluster = feature?.properties?.Cluster;
      if (isCluster) {
        const count = feature?.properties?.Count ?? 1;
        const size = Math.min(34, 22 + Math.log2(count + 1) * 2);
        const html = `<div style="
          width:${size}px;
          height:${size}px;
          border-radius:999px;
          background:${layer.color};
          color:#fff;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:700;
          font-size:12px;
        ">${count}</div>`;
        return L.marker(latlng, {
          icon: L.divIcon({
            html,
            className: 'cluster-marker',
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          })
        });
      }
      const IconComponent = type ? typeIconMap[type] : undefined;

      if (IconComponent) {
        return createIconMarker(latlng, IconComponent);
      }

      // Fallback: render as a simple dot if no icon is mapped for this Type.
      return L.circleMarker(latlng, {
        radius: dense ? 4 : 5,
        color: layer.color,
        weight: 1,
        fillColor: layer.color,
        fillOpacity: 0.9
      });
    };
  }, [dense, layer.color, layerDefault]);

  const onEachFeature = useMemo(() => (feature, leafletLayer) => {
    if (feature?.properties?.Cluster) {
      const count = feature?.properties?.Count ?? 0;
      leafletLayer.bindPopup(`Cluster of ${count} locations. Zoom in for individual points.`, {
        autoClose: true,
        closeButton: true,
        closeOnClick: true,
        maxWidth: 240,
        className: 'poi-popup'
      });
      return;
    }
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

  if (!effectiveFeatures) return null;

  const renderKey = `${layer.id}-${effectiveFeatures?.length ?? 0}-${clusterBelowZoom ? mapZoom : 'nzc'}-${iconVersion}`;

  return (
    <GeoJSON
      key={renderKey}
      data={{ type: 'FeatureCollection', features: effectiveFeatures }}
      pointToLayer={pointToLayer}
      onEachFeature={onEachFeature}
      renderer={renderer}
    />
  );
}
