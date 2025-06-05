import * as React from 'react';
import { useCallback } from 'react';
import { FaWikipediaW } from 'react-icons/fa';
import { CgTrack } from 'react-icons/cg';
import { useDispatch, useSelector } from 'react-redux';
import { savePreference } from '../../../utils/prefs';
import {
  selectIsFollowing, setIsFollowing
} from '../mapSlice';

import styles from './ButtonBar.module.css';
import { selectIsEnabled, setEnabled } from '../../wikipedia/wikipediaSlice';

const ButtonBarView = React.memo(({
  isFollowing, toggleFollow, isWikipediaEnabled, toggleIsEnabled
}) =>
  <div className={styles.main}>
    <button className={`${isFollowing ? styles.active : ''}`} onClick={toggleFollow}>
      <CgTrack size="100%" />
    </button>
    <button className={`${styles.gap} ${isWikipediaEnabled ? styles.active : ''}`} onClick={toggleIsEnabled}>
      <FaWikipediaW size="100%" />
    </button>
  </div>
);

export default function ButtonBar() {
  const dispatch = useDispatch();

  const isFollowing = useSelector(selectIsFollowing);
  const toggleFollow = useCallback(() => {
    dispatch(setIsFollowing(!isFollowing));
  }, [dispatch, isFollowing]);

  const isWikipediaEnabled = useSelector(selectIsEnabled);
  const toggleIsEnabled = useCallback(async () => {
    await savePreference('wikipedia-enabled', !isWikipediaEnabled);
    dispatch(setEnabled(!isWikipediaEnabled));
  }, [dispatch, isWikipediaEnabled]);
  
  return <ButtonBarView 
    isFollowing={isFollowing}
    toggleFollow={toggleFollow}
    isWikipediaEnabled={isWikipediaEnabled}
    toggleIsEnabled={toggleIsEnabled}
  />;
}
