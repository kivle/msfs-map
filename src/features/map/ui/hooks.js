import { useCallback, useEffect, useState } from "react";
import { batch, useDispatch, useSelector } from "react-redux";
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

export function useLoadPreferencesEffect() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load preferences on startup
    batch(() => {
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
    });
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
    shortcutMappings
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

  const changeAutoPlay = useCallback((enabled, distance) => {
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

  return {
    changeEdition,
    changeVoice,
    changeMap,
    changeAutoPlay,
    changeVisualizeSearchRadius,
    changeShowCourseLine,
    changeShortcutMappings
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
