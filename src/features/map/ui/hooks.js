import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAutoPlay, selectAvailableVoices, selectVoice, setAutoPlay, setAvailableVoices, setVoice } from "../../tts/ttsSlice";
import {
  selectAvailableEditions,
  selectEdition,
} from "../../wikipedia/wikipediaSelectors";
import { setEdition, setEnabled } from "../../wikipedia/wikipediaSlice";
import {
  selectAvailableMaps, selectCourseLine, selectCurrentMap, 
  selectShortcutMappings, selectVisualizeSearchRadius, setCurrentMap, 
  setShortcutMappings, setShowCourseLine, setVisualizeSearchRadius, selectDetectRetinaForCurrentMap, setDetectRetina, selectDetectRetinaByMap, setDetectRetinaMap, setMapLayers, setMapLayersEnabled, selectMapLayersEnabled
} from "../mapSlice";
import { selectWebsocketUrl, setWebsocketUrl } from "../../simdata/simdataSlice";
import { loadPreferences, savePreference } from "../../../utils/prefs";

const websocketDefaultPort = '9000';
const websocketDefaultPath = '/ws';

function normalizeWebsocketUrl(value) {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '';

  const hasProtocol = /^wss?:\/\//i.test(trimmed);
  const urlString = hasProtocol ? trimmed : `ws://${trimmed}`;

  try {
    const url = new URL(urlString);
    if (!url.port) {
      url.port = websocketDefaultPort;
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

export function useLoadPreferencesEffect() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load preferences on startup
    async function load() {
      const prefs = await loadPreferences();
      if (prefs['wikipedia-enabled'] !== undefined)
        dispatch(setEnabled(prefs['wikipedia-enabled']));
      if (prefs['wikipedia-edition'])
        dispatch(setEdition(prefs['wikipedia-edition']));
      if (prefs['voice'])
        dispatch(setVoice(prefs['voice']));
      if (prefs['currentMap'])
        dispatch(setCurrentMap(prefs['currentMap']));
      if (prefs['autoPlay'] !== undefined)
        dispatch(setAutoPlay(prefs['autoPlay']));
      if (prefs['visualizeSearchRadius'] !== undefined)
        dispatch(setVisualizeSearchRadius(prefs['visualizeSearchRadius']));
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
    }
    load();
  }, [dispatch]);
}

export function usePreferenceState() {
  const edition = useSelector(selectEdition);
  const availableEditions = useSelector(selectAvailableEditions);
  const voice = useSelector(selectVoice);
  const availableVoices = useSelector(selectAvailableVoices);
  const currentMap = useSelector(selectCurrentMap);
  const availableMaps = useSelector(selectAvailableMaps);
  const autoPlay = useSelector(selectAutoPlay);
  const visualizeSearchRadius = useSelector(selectVisualizeSearchRadius);
  const courseLine = useSelector(selectCourseLine);
  const detectRetina = useSelector(selectDetectRetinaForCurrentMap);
  const shortcutMappings = useSelector(selectShortcutMappings);
  const websocketUrl = useSelector(selectWebsocketUrl);
  const mapLayersEnabled = useSelector(selectMapLayersEnabled);

  return {
    edition,
    availableEditions,
    voice,
    availableVoices,
    currentMap,
    availableMaps,
    autoPlay,
    visualizeSearchRadius,
    courseLine,
    detectRetina,
    shortcutMappings,
    websocketUrl,
    mapLayersEnabled
  };
}

export function usePreferenceCallbacks() {
  const dispatch = useDispatch();
  const detectRetinaByMap = useSelector(selectDetectRetinaByMap);
  const currentMap = useSelector(selectCurrentMap);

  const changeEdition = useCallback(async (e) => {
    await savePreference('wikipedia-edition', e.target.value);
    dispatch(setEdition(e.target.value));
  }, [dispatch]);

  const changeVoice = useCallback(async (e) => {
    await savePreference('voice', e.target.value);
    dispatch(setVoice(e.target.value));
  }, [dispatch]);

  const changeMap = useCallback(async (e) => {
    const mapId = e.target.value;
    dispatch(setCurrentMap(mapId));
    // Persist asynchronously; failures should not block UI update
    savePreference('currentMap', mapId).catch(() => {});
  }, [dispatch]);

  const changeAutoPlay = useCallback(async (enabled) => {
    if (enabled !== undefined)
      await savePreference('autoPlay', enabled);
    dispatch(setAutoPlay(enabled));
  }, [dispatch]);

  const changeVisualizeSearchRadius = useCallback(async (enabled) => {
    await savePreference('visualizeSearchRadius', enabled);
    dispatch(setVisualizeSearchRadius(enabled));
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

  const setAllMapLayersEnabled = useCallback(async (enabled) => {
    await savePreference('mapLayersEnabled', enabled);
    dispatch(setMapLayersEnabled(enabled));
  }, [dispatch]);

  return {
    changeEdition,
    changeVoice,
    changeMap,
    changeAutoPlay,
    changeVisualizeSearchRadius,
    changeShowCourseLine,
    changeDetectRetina,
    changeShortcutMappings,
    changeWebsocketUrl,
    setAllMapLayersEnabled
  };
}

export function useAvailableVoicesEffect() {
  const dispatch = useDispatch();

  useEffect(() => {
    const voicesChanged = () => {
      const newVoices = window.speechSynthesis.getVoices();
      dispatch(setAvailableVoices(newVoices.map(v => v.name)));
    };
    voicesChanged();
    window.speechSynthesis.addEventListener('voiceschanged', voicesChanged);
    
    return () => window.speechSynthesis.removeEventListener('voiceschanged', voicesChanged);
  }, [dispatch]);
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
