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

export function useLoadPreferencesEffect() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load preferences on startup
    if (localStorage['wikipedia-enabled'])
      dispatch(setEnabled(JSON.parse(localStorage['wikipedia-enabled'])));
    if (localStorage['wikipedia-edition'])
      dispatch(setEdition(localStorage['wikipedia-edition']));
    if (localStorage['voice']) 
      dispatch(setVoice(localStorage['voice']));
    if (localStorage['currentMap']) 
      dispatch(setCurrentMap(localStorage['currentMap']));
    if (localStorage['autoPlay']) 
      dispatch(setAutoPlay(JSON.parse(localStorage['autoPlay'])));
    if (localStorage['visualizeSearchRadius'])
      dispatch(setVisualizeSearchRadius(JSON.parse(localStorage['visualizeSearchRadius'])));
    if (localStorage['courseLine'])
      dispatch(setShowCourseLine(JSON.parse(localStorage['courseLine'])));
    if (localStorage['shortcutMappings'])
      dispatch(setShortcutMappings(JSON.parse(localStorage['shortcutMappings'])));
    if (localStorage['websocketUrl'])
      dispatch(setWebsocketUrl(JSON.parse(localStorage['websocketUrl'])));
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

  const changeEdition = useCallback((e) => {
    localStorage['wikipedia-edition'] = e.target.value;
    dispatch(setEdition(e.target.value));
  }, [dispatch]);

  const changeVoice = useCallback((e) => {
    localStorage['voice'] = e.target.value;
    dispatch(setVoice(e.target.value));
  }, [dispatch]);

  const changeMap = useCallback((e) => {
    localStorage['currentMap'] = e.target.value;
    dispatch(setCurrentMap(e.target.value));
  }, [dispatch]);

  const changeAutoPlay = useCallback((enabled) => {
    if (enabled !== undefined)
      localStorage['autoPlay'] = JSON.stringify(enabled);
    dispatch(setAutoPlay(enabled));
  }, [dispatch]);

  const changeVisualizeSearchRadius = useCallback((enabled) => {
    localStorage['visualizeSearchRadius'] = JSON.stringify(enabled);
    dispatch(setVisualizeSearchRadius(enabled));
  }, [dispatch]);

  const changeShowCourseLine = useCallback((enabled) => {
    localStorage['courseLine'] = JSON.stringify(enabled);
    dispatch(setShowCourseLine(enabled));
  }, [dispatch]);

  const changeShortcutMappings = useCallback((mappings) => {
    localStorage['shortcutMappings'] = JSON.stringify(mappings);
    dispatch(setShortcutMappings(mappings));
  }, [dispatch]);

  const changeWebsocketUrl = useCallback((newUrl) => {
    localStorage['websocketUrl'] = JSON.stringify(newUrl);
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
