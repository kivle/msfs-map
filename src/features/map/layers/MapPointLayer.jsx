import React, { useEffect, useMemo, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaPlaneDeparture, FaBuilding, FaTree, FaMountain, FaMapMarkerAlt, FaHelicopter, FaShip, FaExclamationTriangle } from 'react-icons/fa';
import { MdLocationCity, MdTerrain } from 'react-icons/md';
import { GiLighthouse } from 'react-icons/gi';
import { useGeoJson } from './useGeoJson';
import { useTiledGeoJson } from './useTiledGeoJson';

// Unified mapping from Type -> icon component so layers render consistently.
const typeIconMap = {
  airport: FaPlaneDeparture,
  building: FaBuilding,
  helipad: FaHelicopter,
  landform: MdTerrain,
  lighthouse: GiLighthouse,
  mountain: FaMountain,
  park: FaTree,
  globalairport: FaPlaneDeparture,
  poi: FaMapMarkerAlt,
  seaport: FaShip,
  settlement: MdLocationCity
};

// Layer-level fallback types when a feature lacks a Type value.
const layerDefaultType = {
  coreAirports: 'airport',
  globalAirports: 'globalairport',
  photogammetry: 'settlement'
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
    const radius = size / 2;
    ctx.beginPath();
    ctx.arc(radius, radius, radius - 1, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fill();
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

function clusterFeatures(features, map, bucketSizePx, minClusterSize = 2) {
  if (!map) return features;
  const zoom = map.getZoom?.();
  if (!Number.isFinite(zoom)) return features;

  const sizePx = bucketSizePx || 100;
  const buckets = new Map();
  features.forEach((feature) => {
    const [lon, lat] = feature.geometry?.coordinates ?? [];
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;

    const projected = map.project({ lat, lng: lon }, zoom);
    const keyX = Math.floor(projected.x / sizePx);
    const keyY = Math.floor(projected.y / sizePx);
    const key = `${keyX}:${keyY}`;
    if (!buckets.has(key)) buckets.set(key, { xSum: 0, ySum: 0, features: [] });
    const bucket = buckets.get(key);
    bucket.xSum += projected.x;
    bucket.ySum += projected.y;
    bucket.features.push(feature);
  });

  const clustered = [];
  buckets.forEach(({ xSum, ySum, features: bucketFeatures }) => {
    const count = bucketFeatures.length;
    if (count < minClusterSize) {
      clustered.push(...bucketFeatures);
      return;
    }
    const avgX = xSum / count;
    const avgY = ySum / count;
    const { lat, lng } = map.unproject({ x: avgX, y: avgY }, zoom);
    clustered.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties: {
        Name: `${count} locations`,
        Count: count,
        Cluster: true,
        type: bucketFeatures[0]?.properties?.type ?? bucketFeatures[0]?.properties?.Type ?? 'cluster'
      },
      _clusterInternal: {
        center: { lat, lng }
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

function buildTooltip(feature, fallbackLabel, latlng, type, warnElevation) {
  const properties = feature?.properties ?? {};
  const name = properties.name || fallbackLabel;
  const rawIdent = properties.ident || properties.icao || properties.ICAO || properties.Ident;
  const ident = rawIdent ? rawIdent.toString().trim() : undefined;
  const description = properties.description;

  const coords = formatLatLng(latlng);
  const label = [name, ident].filter(Boolean).join(' • ') || fallbackLabel;
  const googleMapsUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coords.query)}`
    : null;
  const openAirportMapUrl = coords && ['airport', 'globalairport'].includes((type || '').toLowerCase()) && ident
    ? `https://openairportmap.org/${encodeURIComponent(ident)}#map=14/${coords.path}`
    : null;

  const links = [
    googleMapsUrl && { label: 'Open in Google Maps', href: googleMapsUrl },
    openAirportMapUrl && { label: 'Open in OpenAirportMap', href: openAirportMapUrl }
  ].filter(Boolean);

  const elevationRaw = properties.elevationFt;
  const elevation = Number.isFinite(parseFloat(elevationRaw)) ? Math.round(parseFloat(elevationRaw)) : null;

  const metadata = [
    ident && { label: 'ICAO', value: ident },
    properties.iata && { label: 'IATA', value: properties.iata },
    properties.location && {
      label: 'Location',
      value: properties.location
    },
    elevation !== null ? { label: 'Elevation', value: `${elevation} ft`, warn: warnElevation } : null,
    properties.timezone && { label: 'Timezone', value: properties.timezone }
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
              {meta.warn && (
                <span style={{ marginLeft: 6, verticalAlign: 'middle' }}>
                  <FaExclamationTriangle
                    color="#d00000"
                    size={12}
                    title="Elevation may be incorrect for some points."
                  />
                </span>
              )}
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
  const clusterMinPoints = layer.clusterMinPoints ?? 2;
  const [iconVersion, setIconVersion] = useState(0);

  const effectiveFeatures = useMemo(() => {
    if (!data?.features) return null;
    if (clusterBelowZoom && mapZoom !== undefined && mapZoom < clusterBelowZoom) {
      const bucketSizePx = 100;
      return clusterFeatures(data.features, map, bucketSizePx, clusterMinPoints);
    }
    return data.features;
  }, [data, clusterBelowZoom, clusterMinPoints, map, mapZoom]);

  const renderer = useMemo(() => (useCanvas ? L.canvas({ padding: 0.5 }) : undefined), [useCanvas]);

  // Pre-request raster icons for types present in the current features
  useEffect(() => {
    if (!effectiveFeatures) return;
    const types = new Set();
    effectiveFeatures.forEach((f) => {
      const t = f?.properties?.type || f?.properties?.Type || layerDefault;
      if (t) types.add(t);
    });
    types.forEach((t) => {
      const IconComponent = typeIconMap[t];
      ensureRasterIcon(t, layer.color, IconComponent, () => setIconVersion((v) => v + 1));
    });
  }, [effectiveFeatures, layer.color, layerDefault]);

  const pointToLayer = useMemo(() => {
    const createIconMarker = (latlng, IconComponent, typeKey) => {
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
      const rawType = feature?.properties?.type || feature?.properties?.Type;
      const type = feature?.properties?.Cluster ? 'cluster' : ((rawType || layerDefault)?.toString?.().toLowerCase?.());
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
        return createIconMarker(latlng, IconComponent, type);
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
      const content = `
        <div>
          Cluster of ${count} locations. Zoom in for individual points.
        </div>
      `;
      leafletLayer.bindPopup(content, {
        autoClose: true,
        closeButton: true,
        closeOnClick: true,
        maxWidth: 260,
        className: 'poi-popup'
      });
      return;
    }
    const rawType = feature?.properties?.type || feature?.properties?.Type;
    const type = feature?.properties?.Cluster ? 'cluster' : ((rawType || layerDefault)?.toString?.().toLowerCase?.());
    const latlng = typeof leafletLayer.getLatLng === 'function'
      ? leafletLayer.getLatLng()
      : (feature?.geometry?.coordinates?.length >= 2
        ? { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] }
        : null);

    const warnElevation = layer.id !== 'globalAirports';
    const tooltip = buildTooltip(feature, layer.label, latlng, type, warnElevation);
    if (tooltip) {
      leafletLayer.bindPopup(tooltip, {
        autoClose: true,
        closeButton: true,
        closeOnClick: true,
        maxWidth: 320,
        className: 'poi-popup'
      });
    }
  }, [layer.label, map, layerDefault]);

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
