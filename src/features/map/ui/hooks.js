import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectAutoPlay, selectAvailableVoices, selectVoice, setAutoPlay, setAvailableVoices, setVoice } from "../../tts/ttsSlice";
import { 
  selectAvailableEditions, 
  selectEdition, setEdition, setEnabled
} from "../../wikipedia/wikipediaSlice";
import { 
  selectAvailableMaps, selectCourseLine, selectCurrentMap, 
  selectShortcutMappings, selectVisualizeSearchRadius, setCurrentMap, 
  setShortcutMappings, setShowCourseLine, setVisualizeSearchRadius 
} from "../mapSlice";
import { selectWebsocketUrl, setWebsocketUrl } from "../../simdata/simdataSlice";
import { loadPreferences, savePreference } from "../../../utils/prefs";

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
      if (prefs['shortcutMappings'])
        dispatch(setShortcutMappings(prefs['shortcutMappings']));
      if (prefs['websocketUrl'])
        dispatch(setWebsocketUrl(prefs['websocketUrl']));
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
  const shortcutMappings = useSelector(selectShortcutMappings);
  const websocketUrl = useSelector(selectWebsocketUrl);

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
    shortcutMappings,
    websocketUrl
  };
}

export function usePreferenceCallbacks() {
  const dispatch = useDispatch();

  const changeEdition = useCallback(async (e) => {
    await savePreference('wikipedia-edition', e.target.value);
    dispatch(setEdition(e.target.value));
  }, [dispatch]);

  const changeVoice = useCallback(async (e) => {
    await savePreference('voice', e.target.value);
    dispatch(setVoice(e.target.value));
  }, [dispatch]);

  const changeMap = useCallback(async (e) => {
    await savePreference('currentMap', e.target.value);
    dispatch(setCurrentMap(e.target.value));
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

  const changeShortcutMappings = useCallback(async (mappings) => {
    await savePreference('shortcutMappings', mappings);
    dispatch(setShortcutMappings(mappings));
  }, [dispatch]);

  const changeWebsocketUrl = useCallback(async (newUrl) => {
    await savePreference('websocketUrl', newUrl);
    dispatch(setWebsocketUrl(newUrl));
  }, [dispatch]);

  return {
    changeEdition,
    changeVoice,
    changeMap,
    changeAutoPlay,
    changeVisualizeSearchRadius,
    changeShowCourseLine,
    changeShortcutMappings,
    changeWebsocketUrl
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
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = useCallback((e) => {
    setExpanded(!expanded);
  }, [expanded]);

  return {
    toggleExpanded,
    expanded
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
