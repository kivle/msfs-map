import * as React from 'react';
import { 
  useAvailableVoicesEffect, 
  useConnectedGamepads, 
  usePreferenceCallbacks, 
  usePreferenceState 
} from './hooks';
import MapPreferencesSection from './MapPreferencesSection';
import WikipediaPreferencesSection from './WikipediaPreferencesSection';
import TtsPreferencesSection from './TtsPreferencesSection';
import WebsocketPreferenceSection from './WebsocketPreferenceSection';
import ShortcutPreferencesSection from './ShortcutPreferencesSection';

const PreferencesPanel = React.memo(({
  currentMap,
  availableMaps,
  detectRetina,
  changeMap,
  changeDetectRetina,
  visualizeSearchRadius,
  changeVisualizeSearchRadius,
  courseLine,
  changeShowCourseLine,
  edition,
  availableEditions,
  changeEdition,
  voice,
  availableVoices,
  changeVoice,
  autoPlay,
  changeAutoPlay,
  websocketUrlInput,
  onWebsocketInputChange,
  onWebsocketInputBlur,
  connectedGamepads,
  shortcutMappings,
  changeShortcutMappings
}) =>
  <>
    <MapPreferencesSection
      currentMap={currentMap}
      availableMaps={availableMaps}
      detectRetina={detectRetina}
      onChangeMap={changeMap}
      onChangeDetectRetina={changeDetectRetina}
      visualizeSearchRadius={visualizeSearchRadius}
      onChangeVisualizeSearchRadius={changeVisualizeSearchRadius}
      courseLine={courseLine}
      onChangeCourseLine={changeShowCourseLine}
    />
    <WikipediaPreferencesSection
      edition={edition}
      availableEditions={availableEditions}
      onChangeEdition={changeEdition}
    />
    <TtsPreferencesSection
      voice={voice}
      availableVoices={availableVoices}
      onChangeVoice={changeVoice}
      autoPlay={autoPlay}
      onChangeAutoPlay={changeAutoPlay}
    />
    <WebsocketPreferenceSection
      value={websocketUrlInput}
      onChange={onWebsocketInputChange}
      onBlur={onWebsocketInputBlur}
    />
    <ShortcutPreferencesSection
      connectedGamepads={connectedGamepads}
      shortcutMappings={shortcutMappings}
      changeShortcutMappings={changeShortcutMappings}
    />
  </>
);

function PreferencesPanelContainer() {
  const {
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
    websocketUrl
  } = usePreferenceState();

  useAvailableVoicesEffect();

  const {
    changeEdition,
    changeVoice,
    changeMap,
    changeAutoPlay,
    changeVisualizeSearchRadius,
    changeShowCourseLine,
    changeDetectRetina,
    changeShortcutMappings,
    changeWebsocketUrl
  } = usePreferenceCallbacks();
  
  const connectedGamepads = useConnectedGamepads();
  const [websocketUrlInput, setWebsocketUrlInput] = React.useState(websocketUrl || '');

  React.useEffect(() => {
    setWebsocketUrlInput(websocketUrl || '');
  }, [websocketUrl]);

  const handleWebsocketInputChange = React.useCallback((value) => {
    setWebsocketUrlInput(value);
  }, []);

  const handleWebsocketInputBlur = React.useCallback((value) => {
    changeWebsocketUrl(value);
  }, [changeWebsocketUrl]);

  return <PreferencesPanel
    changeMap={changeMap}
    currentMap={currentMap}
    availableMaps={availableMaps}
    changeEdition={changeEdition}
    edition={edition}
    availableEditions={availableEditions}
    changeVoice={changeVoice}
    voice={voice}
    availableVoices={availableVoices}
    autoPlay={autoPlay}
    changeAutoPlay={changeAutoPlay}
    visualizeSearchRadius={visualizeSearchRadius}
    changeVisualizeSearchRadius={changeVisualizeSearchRadius}
    courseLine={courseLine}
    changeShowCourseLine={changeShowCourseLine}
    detectRetina={detectRetina}
    changeDetectRetina={changeDetectRetina}
    connectedGamepads={connectedGamepads}
    shortcutMappings={shortcutMappings}
    changeShortcutMappings={changeShortcutMappings}
    websocketUrlInput={websocketUrlInput}
    onWebsocketInputChange={handleWebsocketInputChange}
    onWebsocketInputBlur={handleWebsocketInputBlur}
  />;
}

export { PreferencesPanelContainer };
