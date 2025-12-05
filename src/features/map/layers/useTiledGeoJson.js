import { useEffect, useMemo, useState } from 'react';
import { useMap } from 'react-leaflet';

const manifestCache = new Map();
const tileCache = new Map();
const MAX_TILES_CACHED = 200;

async function fetchJsonWithFallback(primaryUrl, fallbackUrl) {
  let resp;
  try {
    resp = await fetch(primaryUrl);
  } catch (err) {
    if (!fallbackUrl) throw err;
  }

  if (!resp?.ok && fallbackUrl) {
    resp = await fetch(fallbackUrl);
  }

  if (!resp?.ok) {
    throw new Error(`Failed to load ${primaryUrl} (${resp?.status})`);
  }

  return resp.json();
}

function boundsFromLeaflet(bounds) {
  if (!bounds) return null;
  const northEast = bounds.getNorthEast?.();
  const southWest = bounds.getSouthWest?.();
  if (!northEast || !southWest) return null;
  return {
    minLat: southWest.lat,
    maxLat: northEast.lat,
    minLon: southWest.lng,
    maxLon: northEast.lng
  };
}

function intersects(a, b) {
  if (!a || !b) return false;
  return !(a.minLat > b.maxLat || a.maxLat < b.minLat || a.minLon > b.maxLon || a.maxLon < b.minLon);
}

function tileKey(manifestSourceUrl, tileId) {
  return `${manifestSourceUrl}::${tileId}`;
}

export function useTiledGeoJson(manifestUrl, fallbackUrl, minZoom) {
  const map = useMap();
  const initialManifest = manifestUrl ? manifestCache.get(manifestUrl) : null;
  const [manifestState, setManifestState] = useState(() => initialManifest ? { manifest: initialManifest, sourceUrl: manifestUrl } : null);
  const [viewBounds, setViewBounds] = useState(() => (map ? boundsFromLeaflet(map.getBounds?.()) : null));
  const [zoom, setZoom] = useState(() => map?.getZoom?.());
  const [loadedTiles, setLoadedTiles] = useState(() => new Set());
  const [error, setError] = useState(null);

  // Load manifest (with fallback)
  useEffect(() => {
    if (!manifestUrl) return;
    let cancelled = false;
    async function load() {
      try {
        const manifest = await fetchJsonWithFallback(manifestUrl, fallbackUrl);
        if (cancelled) return;
        manifestCache.set(manifestUrl, manifest);
        setManifestState({ manifest, sourceUrl: manifestUrl });
      } catch (err) {
        if (!cancelled) {
          setError(err);
          console.warn('Failed to load manifest', manifestUrl, err);
        }
      }
    }
    if (!manifestCache.has(manifestUrl)) {
      load();
    } else {
      setManifestState({ manifest: manifestCache.get(manifestUrl), sourceUrl: manifestUrl });
    }
    return () => { cancelled = true; };
  }, [manifestUrl, fallbackUrl]);

  // Track viewport bounds
  useEffect(() => {
    if (!map) return undefined;
    const update = () => {
      setViewBounds(boundsFromLeaflet(map.getBounds?.()));
      setZoom(map.getZoom?.());
    };
    update();
    map.on('moveend zoomend', update);
    return () => {
      map.off('moveend zoomend', update);
    };
  }, [map]);

  const withinZoom = minZoom ? (zoom ?? -Infinity) >= minZoom : true;

  // Clear loaded tiles when we fall below the zoom threshold so data disappears.
  useEffect(() => {
    if (!withinZoom) {
      setLoadedTiles(new Set());
    }
  }, [withinZoom]);

  const visibleTiles = useMemo(() => {
    if (!manifestState?.manifest || !viewBounds || !withinZoom) return [];
    return manifestState.manifest.tiles.filter((tile) => intersects(tile.bounds, viewBounds));
  }, [manifestState, viewBounds, withinZoom]);

  // Load tiles that intersect the viewport
  useEffect(() => {
    if (!manifestState?.manifest || !manifestState.sourceUrl || !withinZoom) return;
    let cancelled = false;
    const { manifest, sourceUrl } = manifestState;

    async function loadTiles() {
      for (const tile of visibleTiles) {
        const cacheKey = tileKey(sourceUrl, tile.id);
        if (tileCache.has(cacheKey)) {
          const cached = tileCache.get(cacheKey);
          cached.lastUsed = Date.now();
          setLoadedTiles((prev) => {
            if (prev.has(tile.id)) return prev;
            const next = new Set(prev);
            next.add(tile.id);
            return next;
          });
          continue;
        }

        try {
          const primaryTileUrl = new URL(tile.file, sourceUrl).toString();
          const fallbackTileUrl = fallbackUrl ? new URL(tile.file, fallbackUrl).toString() : null;
          const json = await fetchJsonWithFallback(primaryTileUrl, fallbackTileUrl);
          if (cancelled) return;
          tileCache.set(cacheKey, { data: json, lastUsed: Date.now() });
          setLoadedTiles((prev) => {
            const next = new Set(prev);
            next.add(tile.id);
            return next;
          });
        } catch (err) {
          if (!cancelled) {
            setError(err);
            console.warn('Failed to load tile', tile.id, err);
          }
        }
      }

      // Evict least-recently-used tiles when over budget
      const keys = Array.from(tileCache.keys());
      if (keys.length > MAX_TILES_CACHED) {
        const entries = keys.map((key) => ({ key, lastUsed: tileCache.get(key)?.lastUsed ?? 0 }));
        entries.sort((a, b) => a.lastUsed - b.lastUsed);
        const toDelete = entries.slice(0, Math.max(0, entries.length - MAX_TILES_CACHED));
        toDelete.forEach(({ key }) => tileCache.delete(key));
      }
    }

    loadTiles();
    return () => { cancelled = true; };
  }, [manifestState, visibleTiles, fallbackUrl, withinZoom]);

  const data = useMemo(() => {
    if (!manifestState?.manifest || !manifestState.sourceUrl || !withinZoom) return null;
    const features = [];
    loadedTiles.forEach((tileId) => {
      const cacheKey = tileKey(manifestState.sourceUrl, tileId);
      const tileData = tileCache.get(cacheKey);
      if (tileData?.data?.features?.length) {
        tileData.lastUsed = Date.now();
        features.push(...tileData.data.features);
      }
    });
    return {
      type: 'FeatureCollection',
      features
    };
  }, [loadedTiles, manifestState, withinZoom]);

  return { data, error };
}
