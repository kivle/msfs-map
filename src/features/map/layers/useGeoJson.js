import { useEffect, useState } from 'react';

const geojsonCache = new Map();

export function useGeoJson(url, fallbackUrl) {
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
        let resp = await fetch(url, { cache: 'no-store' });
        if (!resp.ok && fallbackUrl) {
          resp = await fetch(fallbackUrl, { cache: 'no-store' });
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
  }, [url, fallbackUrl]);

  return { data, error };
}
