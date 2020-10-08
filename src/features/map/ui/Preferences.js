import * as React from 'react';
import { useCallback, useEffect } from 'react';
import ISO6391 from 'iso-639-1';
import { useDispatch, useSelector } from 'react-redux';
import { 
  selectAvailableEditions, selectEdition, setEdition, setVoice, 
  setAvailableVoices, selectVoice, selectAvailableVoices 
} from '../../wikipedia/wikipediaSlice';
import styles from './Preferences.module.css';

export default function Preferences() {
  const dispatch = useDispatch();
  const edition = useSelector(selectEdition);
  const availableEditions = useSelector(selectAvailableEditions);
  const voice = useSelector(selectVoice);
  const availableVoices = useSelector(selectAvailableVoices);

  const changeEdition = useCallback((e) => {
    dispatch(setEdition(e.target.value));
  }, [dispatch]);

  const changeVoice = useCallback((e) => {
    dispatch(setVoice(e.target.value));
  }, [dispatch]);

  useEffect(() => {
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length) {
      dispatch(setAvailableVoices(voices.map(v => v.name)));
    }
    const voicesChanged = e => {
      const newVoices = window.speechSynthesis.getVoices();
      dispatch(setAvailableVoices(newVoices.map(v => v.name)));
    };
    window.speechSynthesis.addEventListener('voiceschanged', voicesChanged);
    
    return () => window.speechSynthesis.removeEventListener('voiceschanged', voicesChanged);
  }, [dispatch]);

  return (
    <div className={styles.main}>
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
