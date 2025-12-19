import * as React from 'react';
import { 
  useConnectedGamepads, 
  usePreferenceCallbacks, 
  usePreferenceState 
} from './hooks';
import MapPreferencesSection from './MapPreferencesSection';
import WikipediaPreferencesSection from './WikipediaPreferencesSection';
import WebsocketPreferenceSection from './WebsocketPreferenceSection';
import ShortcutPreferencesSection from './ShortcutPreferencesSection';

const PreferencesPanel = React.memo(({
  visualizeSearchRadius,
  changeVisualizeSearchRadius,
  courseLine,
  changeShowCourseLine,
  marchingSpeedKnots,
  changeMarchingSpeedKnots,
  edition,
  availableEditions,
  changeEdition,
  websocketUrlInput,
  onWebsocketInputChange,
  onWebsocketInputBlur,
  connectedGamepads,
  shortcutMappings,
  changeShortcutMappings
}) =>
  <>
    <MapPreferencesSection
      visualizeSearchRadius={visualizeSearchRadius}
      onChangeVisualizeSearchRadius={changeVisualizeSearchRadius}
      courseLine={courseLine}
      onChangeCourseLine={changeShowCourseLine}
      marchingSpeedKnots={marchingSpeedKnots}
      onChangeMarchingSpeedKnots={changeMarchingSpeedKnots}
    />
    <WikipediaPreferencesSection
      edition={edition}
      availableEditions={availableEditions}
      onChangeEdition={changeEdition}
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
    visualizeSearchRadius,
    courseLine,
    shortcutMappings,
    websocketUrl,
    marchingSpeedKnots
  } = usePreferenceState();

  const {
    changeEdition,
    changeVisualizeSearchRadius,
    changeShowCourseLine,
    changeShortcutMappings,
    changeWebsocketUrl,
    changeMarchingSpeedKnots
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
    changeEdition={changeEdition}
    edition={edition}
    availableEditions={availableEditions}
    visualizeSearchRadius={visualizeSearchRadius}
    changeVisualizeSearchRadius={changeVisualizeSearchRadius}
    courseLine={courseLine}
    changeShowCourseLine={changeShowCourseLine}
    marchingSpeedKnots={marchingSpeedKnots}
    changeMarchingSpeedKnots={changeMarchingSpeedKnots}
    connectedGamepads={connectedGamepads}
    shortcutMappings={shortcutMappings}
    changeShortcutMappings={changeShortcutMappings}
    websocketUrlInput={websocketUrlInput}
    onWebsocketInputChange={handleWebsocketInputChange}
    onWebsocketInputBlur={handleWebsocketInputBlur}
  />;
}

export { PreferencesPanelContainer };
