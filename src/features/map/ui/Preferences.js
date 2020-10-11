import * as React from 'react';
import { useCallback, useEffect } from 'react';
import ISO6391 from 'iso-639-1';
import { batch, useDispatch, useSelector } from 'react-redux';
import { 
  selectAvailableEditions, selectEdition, setEdition, setVoice, 
  setAvailableVoices, selectVoice, selectAvailableVoices 
} from '../../wikipedia/wikipediaSlice';
import styles from './Preferences.module.css';
import { selectAvailableTileServers, selectTileServer, setTileServer } from '../mapSlice';

export default function Preferences() {
  const dispatch = useDispatch();
  const edition = useSelector(selectEdition);
  const availableEditions = useSelector(selectAvailableEditions);
  const voice = useSelector(selectVoice);
  const availableVoices = useSelector(selectAvailableVoices);
  const tileServer = useSelector(selectTileServer);
  const availableTileServers = useSelector(selectAvailableTileServers);

  useEffect(() => {
    // Load preferences on startup
    batch(() => {
      if (localStorage['wikipedia-edition']) dispatch(setEdition(localStorage['wikipedia-edition']));
      if (localStorage['voice']) dispatch(setVoice(localStorage['voice']));
      if (localStorage['tileServer']) dispatch(setTileServer(localStorage['tileServer']));
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

  const changeTileServer = useCallback((e) => {
    localStorage['tileServer'] = e.target.value;
    dispatch(setTileServer(e.target.value));
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
        <label htmlFor="tileserver">Map</label>
        <select id="tileserver" onChange={changeTileServer} value={tileServer}>
          {availableTileServers.map(
            server =>
              <option key={server.tileServer} value={server.tileServer}>
                {server.name}
              </option>
          )}
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
