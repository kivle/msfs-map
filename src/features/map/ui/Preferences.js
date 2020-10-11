import * as React from 'react';
import { useCallback, useEffect } from 'react';
import ISO6391 from 'iso-639-1';
import { batch, useDispatch, useSelector } from 'react-redux';
import { 
  selectAvailableEditions, selectEdition, setEdition, setVoice, 
  setAvailableVoices, selectVoice, selectAvailableVoices 
} from '../../wikipedia/wikipediaSlice';
import styles from './Preferences.module.css';
import { selectAvailableMaps, selectCurrentMap, setCurrentMap } from '../mapSlice';

export default function Preferences() {
  const dispatch = useDispatch();
  const edition = useSelector(selectEdition);
  const availableEditions = useSelector(selectAvailableEditions);
  const voice = useSelector(selectVoice);
  const availableVoices = useSelector(selectAvailableVoices);
  const currentMap = useSelector(selectCurrentMap);
  const availableMaps = useSelector(selectAvailableMaps);

  useEffect(() => {
    // Load preferences on startup
    batch(() => {
      if (localStorage['wikipedia-edition']) dispatch(setEdition(localStorage['wikipedia-edition']));
      if (localStorage['voice']) dispatch(setVoice(localStorage['voice']));
      if (localStorage['currentMap']) dispatch(setCurrentMap(localStorage['currentMap']));
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
        <label htmlFor="voice">Voice</label>
        <select id="voice" onChange={changeVoice} value={voice}>
          {availableVoices.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
    </div>
  );
};
