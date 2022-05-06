import * as React from 'react';
import ISO6391 from 'iso-639-1';
import styles from './Preferences.module.css';
import { FaCog, FaCaretRight } from 'react-icons/fa';
import { 
  useAvailableVoicesEffect, 
  useConnectedGamepads, 
  useExpandedState, 
  usePreferenceCallbacks, 
  usePreferenceState 
} from './hooks';
import ShortcutMappings from './ShortcutMappings';

const PreferencesPanel = React.memo(({
  changeMap, currentMap, availableMaps,
  changeEdition, edition, availableEditions, changeVoice, voice, 
  availableVoices, autoPlay, autoPlayDistance, changeAutoPlay, 
  visualizeSearchRadius, changeVisualizeSearchRadius,
  courseLine, changeShowCourseLine, connectedGamepads, shortcutMappings,
  changeShortcutMappings
}) =>
  <>
    <div className={styles.preference}>
      <label htmlFor="mapserver">Map</label>
      <select id="mapserver" onChange={changeMap} value={currentMap.name}>
        {availableMaps.map(({name}) => <option key={name} value={name}>{name}</option>)}
      </select>
    </div>
    <div className={styles.preference}>
      <label htmlFor="wikipedia-edition">Wikipedia Edition</label>
      <select id="wikipedia-edition" onChange={changeEdition} value={edition}>
        {availableEditions.map(
          e => 
            <option key={e} value={e}>
              {ISO6391.getName(e) ? `${ISO6391.getName(e)} (${e})` : e}
            </option>
        )}
      </select>
    </div>
    <div className={styles.preference}>
      <label htmlFor="visualizeSearchRadius">Visualize search radius on map</label>
      <input id="visualizeSearchRadius" type="checkbox" checked={visualizeSearchRadius} onChange={(e) => changeVisualizeSearchRadius(e.target.checked)} />
    </div>
    <div className={styles.preference}>
      <label htmlFor="showCourseLine">Show course line</label>
      <input id="showCourseLine" type="checkbox" checked={courseLine} onChange={(e) => changeShowCourseLine(e.target.checked)} />
    </div>
    <div className={styles.preference}>
      <label htmlFor="voice">Voice</label>
      <select id="voice" onChange={changeVoice} value={voice}>
        {availableVoices.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    </div>
    <div className={styles.preference}>
      <label htmlFor="autoPlay">Enable automatically reading articles</label>
      <input id="autoPlay" type="checkbox" checked={autoPlay} onChange={(e) => changeAutoPlay(e.target.checked)} />
    </div>
    {autoPlay && <div className={styles.preference}>
      <label htmlFor="autoPlayDistance">Read articles when they are in front and within distance</label>
      <select id="autoPlayDistance" onChange={(e) => changeAutoPlay(undefined, parseInt(e.target.value, 10))} value={autoPlayDistance}>
        {[100, 500, 1000, 2000, 5000, 10000, 20000].map(r =>
          <option key={r} value={r}>{`${r} m`}</option>
        )}
      </select>
    </div>}
    <div className={styles.preference}>
      <ShortcutMappings
        connectedGamepads={connectedGamepads}
        shortcutMappings={shortcutMappings}
        changeShortcutMappings={changeShortcutMappings}
      />
    </div>
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
    autoPlayDistance,
    visualizeSearchRadius,
    courseLine,
    shortcutMappings
  } = usePreferenceState();

  useAvailableVoicesEffect();

  const {
    changeEdition,
    changeVoice,
    changeMap,
    changeAutoPlay,
    changeVisualizeSearchRadius,
    changeShowCourseLine,
    changeShortcutMappings
  } = usePreferenceCallbacks();
  
  const connectedGamepads = useConnectedGamepads();

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
    autoPlayDistance={autoPlayDistance}
    changeAutoPlay={changeAutoPlay}
    visualizeSearchRadius={visualizeSearchRadius}
    changeVisualizeSearchRadius={changeVisualizeSearchRadius}
    courseLine={courseLine}
    changeShowCourseLine={changeShowCourseLine}
    connectedGamepads={connectedGamepads}
    shortcutMappings={shortcutMappings}
    changeShortcutMappings={changeShortcutMappings}
  />;
}

export default function Preferences() {
  const {
    toggleExpanded,
    expanded
  } = useExpandedState();

  return (
    <div className={styles.main}>
      <button 
        className={`${styles.preferenceButton}${expanded ? ` ${styles.expanded}` : ''}`}
        onClick={toggleExpanded}>
        <FaCog size="100%" />
        <FaCaretRight className={styles.caret} />
      </button>
      {!!expanded && <PreferencesPanelContainer />}
    </div>
  );
};
