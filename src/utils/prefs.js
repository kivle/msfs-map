import localforage from 'localforage';

export const preferenceKeys = [
  'wikipedia-enabled',
  'wikipedia-edition',
  'voice',
  'currentMap',
  'autoPlay',
  'visualizeSearchRadius',
  'courseLine',
  'shortcutMappings',
  'detectRetina',
  'websocketUrl'
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
