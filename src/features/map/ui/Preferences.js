import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import ISO6391 from 'iso-639-1';
import { batch, useDispatch, useSelector } from 'react-redux';
import { 
  selectAvailableEditions, selectEdition, setEdition, setVoice, 
  setAvailableVoices, selectVoice, selectAvailableVoices, selectSearchRadius,
  setSearchRadius,
  classifyPages
} from '../../wikipedia/wikipediaSlice';
import styles from './Preferences.module.css';
import { selectAvailableMaps, selectCurrentMap, setCurrentMap } from '../mapSlice';
import { FaCog, FaCaretRight } from 'react-icons/fa';
import ML from '../../../utils/ml';

export default function Preferences() {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const edition = useSelector(selectEdition);
  const availableEditions = useSelector(selectAvailableEditions);
  const voice = useSelector(selectVoice);
  const availableVoices = useSelector(selectAvailableVoices);
  const currentMap = useSelector(selectCurrentMap);
  const availableMaps = useSelector(selectAvailableMaps);
  const searchRadius = useSelector(selectSearchRadius);

  useEffect(() => {
    // Load preferences on startup
    batch(() => {
      if (localStorage['wikipedia-edition']) dispatch(setEdition(localStorage['wikipedia-edition']));
      if (localStorage['voice']) dispatch(setVoice(localStorage['voice']));
      if (localStorage['currentMap']) dispatch(setCurrentMap(localStorage['currentMap']));
      if (localStorage['searchRadius']) dispatch(setSearchRadius(localStorage['searchRadius']));
    });
  }, [dispatch]);

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

  const changeSearchRadius = useCallback((e) => {
    localStorage['searchRadius'] = e.target.value;
    dispatch(setSearchRadius(e.target.value));
  }, [dispatch]);

  const toggleExpanded = useCallback((e) => {
    setExpanded(!expanded);
  }, [expanded]);

  const clearTrainingData = useCallback(() => {
    ML.clearClassifier();
    dispatch(classifyPages(true));
  }, [dispatch]);

  useEffect(() => {
    const voicesChanged = () => {
      const newVoices = window.speechSynthesis.getVoices();
      dispatch(setAvailableVoices(newVoices.map(v => v.name)));
    };
    voicesChanged();
    window.speechSynthesis.addEventListener('voiceschanged', voicesChanged);
    
    return () => window.speechSynthesis.removeEventListener('voiceschanged', voicesChanged);
  }, [dispatch]);

  return (
    <div className={styles.main}>
      <button 
        className={`${styles.preferenceButton}${expanded ? ` ${styles.expanded}` : ''}`}
        onClick={toggleExpanded}>
        <FaCog size="100%" />
        <FaCaretRight className={styles.caret} />
      </button>
      {expanded && <>
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
          <label htmlFor="searchRadius">Wikipedia search radius</label>
          <select id="searchRadius" onChange={changeSearchRadius} value={searchRadius}>
            {[5000, 10000, 20000, 50000, 100000].map(r =>
              <option key={r} value={r}>{`${r} meters`}</option>
            )}
          </select>
        </div>
        <div className={styles.preference}>
          <label htmlFor="voice">Voice</label>
          <select id="voice" onChange={changeVoice} value={voice}>
            {availableVoices.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div className={styles.preference}>
          <button type="button" onClick={clearTrainingData}>Clear traning data</button>
        </div>
      </>}
    </div>
  );
};
