import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAvailableEditions,
  selectEdition,
} from "../../wikipedia/wikipediaSelectors";
import { setEdition } from "../../wikipedia/wikipediaSlice";
import {
  selectAvailableMaps, selectCourseLine, selectCurrentMap,
  selectShortcutMappings, setCurrentMap,
  setShortcutMappings, setShowCourseLine, selectDetectRetinaForCurrentMap, setDetectRetina, selectDetectRetinaByMap, setDetectRetinaMap, setMapLayers, setMapLayersEnabled, selectMapLayersEnabled
} from "../mapSlice";
import { selectMarchingSpeedKnots, setMarchingSpeedKnots } from "../mapSlice";
import { selectWebsocketUrl, setWebsocketUrl } from "../../simdata/simdataSlice";
import { loadPreferences, savePreference } from "../../../utils/prefs";
import { setPreferencesLoaded } from "../mapSlice";

const websocketDefaultPort = '9000';
const websocketSecureDefaultPort = '9443';
const websocketDefaultPath = '/ws';
let editionChangeRequested = false;

function normalizeWebsocketUrl(value) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';

  const hasProtocol = /^wss?:\/\//i.test(trimmed);
  const inferredProtocol = hasProtocol ? '' : determineProtocol(trimmed);
  const urlString = hasProtocol ? trimmed : `${inferredProtocol}${trimmed}`;

  try {
    const url = new URL(urlString);
    const isSecure = url.protocol === 'wss:';
    if (!url.port) {
      url.port = isSecure ? websocketSecureDefaultPort : websocketDefaultPort;
    } else if (!hasProtocol) {
      // If the user typed a port with no protocol, keep their port but ensure protocol stays consistent with host
      url.protocol = isSecureHost(url.hostname) ? 'wss:' : 'ws:';
    }

    if (!hasProtocol) {
      url.protocol = isSecureHost(url.hostname) ? 'wss:' : 'ws:';
    }

    if (!url.pathname || url.pathname === '/') {
      url.pathname = websocketDefaultPath;
    }
    return url.toString();
  } catch {
    // Fall back to original input if parsing fails; caller can still handle it.
    return trimmed;
  }
}

function isSecureHost(hostname) {
  return hostname !== 'localhost' && hostname !== '127.0.0.1';
}

function determineProtocol(hostname) {
  return isSecureHost(hostname) ? 'wss://' : 'ws://';
}

export function useLoadPreferencesEffect() {
  const dispatch = useDispatch();
  const edition = useSelector(selectEdition);
  const latestEditionRef = useRef(edition);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    latestEditionRef.current = edition;
  }, [edition]);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    // Load preferences on startup
    async function load() {
      const prefs = await loadPreferences();
      if (prefs['wikipedia-edition'] && !editionChangeRequested) {
        const storedEdition = prefs['wikipedia-edition'];
        const currentEdition = latestEditionRef.current;
        if (storedEdition !== currentEdition && currentEdition === 'en' && storedEdition !== 'en') {
          dispatch(setEdition(storedEdition));
        }
      }
      if (prefs['currentMap'])
        dispatch(setCurrentMap(prefs['currentMap']));
      if (prefs['courseLine'] !== undefined)
        dispatch(setShowCourseLine(prefs['courseLine']));
      if (prefs['detectRetinaByMap'] !== undefined)
        dispatch(setDetectRetinaMap(prefs['detectRetinaByMap']));
      if (prefs['shortcutMappings'])
        dispatch(setShortcutMappings(prefs['shortcutMappings']));
      if (prefs['websocketUrl'])
        dispatch(setWebsocketUrl(normalizeWebsocketUrl(prefs['websocketUrl'])));
      if (prefs['mapLayers'])
        dispatch(setMapLayers(prefs['mapLayers']));
      if (prefs['mapLayersEnabled'] !== undefined)
        dispatch(setMapLayersEnabled(!!prefs['mapLayersEnabled']));
      if (prefs['marchingSpeedKnots'] !== undefined)
        dispatch(setMarchingSpeedKnots(prefs['marchingSpeedKnots']));
      dispatch(setPreferencesLoaded(true));
    }
    load();
  }, [dispatch]);
}

export function usePreferenceState() {
  const edition = useSelector(selectEdition);
  const availableEditions = useSelector(selectAvailableEditions);
  const currentMap = useSelector(selectCurrentMap);
  const availableMaps = useSelector(selectAvailableMaps);
  const courseLine = useSelector(selectCourseLine);
  const detectRetina = useSelector(selectDetectRetinaForCurrentMap);
  const shortcutMappings = useSelector(selectShortcutMappings);
  const websocketUrl = useSelector(selectWebsocketUrl);
  const mapLayersEnabled = useSelector(selectMapLayersEnabled);
  const marchingSpeedKnots = useSelector(selectMarchingSpeedKnots);

  return {
    edition,
    availableEditions,
    currentMap,
    availableMaps,
    courseLine,
    detectRetina,
    shortcutMappings,
    websocketUrl,
    mapLayersEnabled,
    marchingSpeedKnots
  };
}

export function usePreferenceCallbacks() {
  const dispatch = useDispatch();
  const detectRetinaByMap = useSelector(selectDetectRetinaByMap);
  const currentMap = useSelector(selectCurrentMap);
  const marchingSpeedKnots = useSelector(selectMarchingSpeedKnots);

  const changeEdition = useCallback(async (e) => {
    const value = e.target.value;
    editionChangeRequested = true;
    dispatch(setEdition(value));
    savePreference('wikipedia-edition', value).catch(() => {});
  }, [dispatch]);

  const changeMap = useCallback(async (e) => {
    const mapId = e.target.value;
    dispatch(setCurrentMap(mapId));
    // Persist asynchronously; failures should not block UI update
    savePreference('currentMap', mapId).catch(() => {});
  }, [dispatch]);

  const changeShowCourseLine = useCallback(async (enabled) => {
    await savePreference('courseLine', enabled);
    dispatch(setShowCourseLine(enabled));
  }, [dispatch]);

  const changeDetectRetina = useCallback(async (enabled) => {
    const mapId = currentMap?.id;
    if (!mapId) return;
    dispatch(setDetectRetina({ mapId, enabled }));
    const updated = { ...(detectRetinaByMap ?? {}) };
    updated[mapId] = enabled;
    savePreference('detectRetinaByMap', updated).catch(() => {});
  }, [dispatch, currentMap, detectRetinaByMap]);

  const changeShortcutMappings = useCallback(async (mappings) => {
    await savePreference('shortcutMappings', mappings);
    dispatch(setShortcutMappings(mappings));
  }, [dispatch]);

  const changeWebsocketUrl = useCallback(async (newUrl) => {
    const normalized = normalizeWebsocketUrl(newUrl);
    await savePreference('websocketUrl', normalized);
    dispatch(setWebsocketUrl(normalized));
  }, [dispatch]);

  const changeMarchingSpeedKnots = useCallback(async (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) return;
    if (numeric === marchingSpeedKnots) return;
    await savePreference('marchingSpeedKnots', numeric);
    dispatch(setMarchingSpeedKnots(numeric));
  }, [dispatch]);

  const setAllMapLayersEnabled = useCallback(async (enabled) => {
    await savePreference('mapLayersEnabled', enabled);
    dispatch(setMapLayersEnabled(enabled));
  }, [dispatch]);

  return {
    changeEdition,
    changeMap,
    changeShowCourseLine,
    changeDetectRetina,
    changeShortcutMappings,
    changeWebsocketUrl,
    setAllMapLayersEnabled,
    changeMarchingSpeedKnots
  };
}

export function useExpandedState() {
  const [openPanel, setOpenPanel] = useState(null);

  const togglePanel = useCallback((panel) => {
    setOpenPanel((current) => current === panel ? null : panel);
  }, []);

  return {
    togglePanel,
    openPanel
  };
}

export function useConnectedGamepads() {
  const [connectedGamepads, setConnectedGamepads] = useState([]);

  useEffect(() => {
    const gamepadsChanged = () => {
      setConnectedGamepads(navigator.getGamepads?.() ?? []);
    };
    window.addEventListener('gamepadconnected', gamepadsChanged);
    window.addEventListener('gamepaddisconnected', gamepadsChanged);
    gamepadsChanged();
    return () => {
      window.removeEventListener('gamepadconnected', gamepadsChanged);
      window.removeEventListener('gamepaddisconnected', gamepadsChanged);
    };
  }, []);

  return connectedGamepads;
}
