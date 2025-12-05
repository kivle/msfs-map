import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { FaWikipediaW, FaExpand, FaCompress } from 'react-icons/fa';
import { CgTrack } from 'react-icons/cg';
import { useDispatch, useSelector } from 'react-redux';
import { savePreference } from '../../../utils/prefs';
import {
  selectIsFollowing, setIsFollowing
} from '../mapSlice';

import styles from './ButtonBar.module.css';
import { selectIsEnabled } from '../../wikipedia/wikipediaSelectors';
import { setEnabled } from '../../wikipedia/wikipediaSlice';

const ButtonBarView = React.memo(({
  isFollowing, toggleFollow, isWikipediaEnabled, toggleIsEnabled, isFullscreen, toggleFullscreen
}) =>
  <div className={styles.main}>
    <button className={`${isFollowing ? styles.active : ''}`} onClick={toggleFollow}>
      <CgTrack size="100%" />
    </button>
    <button className={`${styles.gap} ${isWikipediaEnabled ? styles.active : ''}`} onClick={toggleIsEnabled}>
      <FaWikipediaW size="100%" />
    </button>
    <button
      className={`${styles.gap} ${isFullscreen ? styles.active : ''}`}
      onClick={toggleFullscreen}
      title="Toggle fullscreen"
    >
      {isFullscreen ? <FaCompress size="100%" /> : <FaExpand size="100%" />}
    </button>
  </div>
);

export default function ButtonBar() {
  const dispatch = useDispatch();
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document?.fullscreenElement));

  const isFollowing = useSelector(selectIsFollowing);
  const toggleFollow = useCallback(() => {
    dispatch(setIsFollowing(!isFollowing));
  }, [dispatch, isFollowing]);

  const isWikipediaEnabled = useSelector(selectIsEnabled);
  const toggleIsEnabled = useCallback(async () => {
    await savePreference('wikipedia-enabled', !isWikipediaEnabled);
    dispatch(setEnabled(!isWikipediaEnabled));
  }, [dispatch, isWikipediaEnabled]);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document?.fullscreenElement));
    document?.addEventListener('fullscreenchange', handleChange);
    handleChange();
    return () => document?.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document?.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document?.documentElement?.requestFullscreen?.();
      }
    } catch {
      // Ignore fullscreen errors (e.g., browser disallows without user gesture).
    }
  }, []);
  
  return <ButtonBarView 
    isFollowing={isFollowing}
    toggleFollow={toggleFollow}
    isWikipediaEnabled={isWikipediaEnabled}
    toggleIsEnabled={toggleIsEnabled}
    isFullscreen={isFullscreen}
    toggleFullscreen={toggleFullscreen}
  />;
}
