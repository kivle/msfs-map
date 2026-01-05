import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { FaExpand, FaCompress, FaStar } from 'react-icons/fa';
import { CgTrack } from 'react-icons/cg';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectFavoriteAddMode,
  selectIsFollowing,
  setFavoriteAddMode,
  setIsFollowing
} from '../mapSlice';

import styles from './ButtonBar.module.css';
const ButtonBarView = React.memo(({
  isFollowing,
  toggleFollow,
  isFullscreen,
  toggleFullscreen,
  isAddingFavorite,
  toggleFavoriteMode
}) =>
  <div className={styles.main}>
    <button className={`${isFollowing ? styles.active : ''}`} onClick={toggleFollow}>
      <CgTrack size="100%" />
    </button>
    <button
      className={`${styles.gap} ${isAddingFavorite ? styles.active : ''}`}
      onClick={toggleFavoriteMode}
      title="Add a favorite"
    >
      <FaStar size="100%" />
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
  const isAddingFavorite = useSelector(selectFavoriteAddMode);
  const toggleFollow = useCallback(() => {
    dispatch(setIsFollowing(!isFollowing));
  }, [dispatch, isFollowing]);
  const toggleFavoriteMode = useCallback(() => {
    dispatch(setFavoriteAddMode(!isAddingFavorite));
  }, [dispatch, isAddingFavorite]);

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
    isFullscreen={isFullscreen}
    toggleFullscreen={toggleFullscreen}
    isAddingFavorite={isAddingFavorite}
    toggleFavoriteMode={toggleFavoriteMode}
  />;
}
