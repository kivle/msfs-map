import localforage from 'localforage';

const FAVORITES_KEY = 'favoriteLocations';

function normalizeFavorite(entry) {
  if (!entry) return null;
  const lat = Number(entry.lat);
  const lng = Number(entry.lng);
  const name = typeof entry.name === 'string' ? entry.name.trim() : '';
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !name) return null;
  const id = typeof entry.id === 'string' && entry.id.trim()
    ? entry.id
    : `fav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    name,
    lat,
    lng,
    createdAt: Number.isFinite(entry.createdAt) ? entry.createdAt : Date.now()
  };
}

export async function loadFavorites() {
  const stored = await localforage.getItem(FAVORITES_KEY);
  if (!Array.isArray(stored)) return [];
  return stored.map(normalizeFavorite).filter(Boolean);
}

export async function saveFavorites(favorites) {
  await localforage.setItem(FAVORITES_KEY, favorites);
}
