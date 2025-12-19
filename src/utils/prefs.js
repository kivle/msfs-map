import localforage from 'localforage';

export const preferenceKeys = [
  'wikipedia-enabled',
  'wikipedia-edition',
  'currentMap',
  'visualizeSearchRadius',
  'courseLine',
  'shortcutMappings',
  'detectRetinaByMap',
  'mapView',
  'websocketUrl',
  'mapLayers',
  'mapLayersEnabled',
  'marchingSpeedKnots'
];

export async function loadPreferences() {
  const prefs = {};
  for (const key of preferenceKeys) {
    const value = await localforage.getItem(key);
    if (value !== null) {
      prefs[key] = value;
    }
  }
  return prefs;
}

export async function savePreference(key, value) {
  await localforage.setItem(key, value);
}
