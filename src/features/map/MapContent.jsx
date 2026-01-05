import React, { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import Wikipedia from "./layers/Wikipedia";
import { selectCourseLine, selectCurrentMap, selectDetectRetinaForCurrentMap, selectFavoriteAddMode, selectIsFollowing, selectMapLayerVisibility } from "./mapSlice";
import { selectMarchingSpeedKnots } from "./mapSlice";
import { selectIsEnabled } from '../wikipedia/wikipediaSelectors';
import { setEnabled } from "../wikipedia/wikipediaSlice";
import { MainLayer } from "./layers/MainLayer";
import { selectSimdata } from "../simdata/simdataSlice";
import PointLayers from "./layers/PointLayers";
import CourseLine from "./layers/CourseLine";
import Plane from "./layers/Plane";
import { useShortcutMappingsEffect } from "./shortcutHooks";
import { MapViewPersistence } from "./components/MapViewPersistence";
import DistanceScaleControl from "./components/DistanceScaleControl";
import FavoritesLayer from "./layers/FavoritesLayer";
import FavoriteDialog from "./components/FavoriteDialog";
import { loadFavorites, saveFavorites } from "./favoritesStorage";
import { favoritesLayerDefinition } from "./mapLayers";

export default function MapContent() {
  const map = useMap();
  const dispatch = useDispatch();
  const marchingSpeedKnots = useSelector(selectMarchingSpeedKnots);
  const [favorites, setFavorites] = useState([]);
  const [draftFavorite, setDraftFavorite] = useState(null);
  const [activeFavorite, setActiveFavorite] = useState(null);
  const favoriteAddMode = useSelector(selectFavoriteAddMode);

  useShortcutMappingsEffect();

  const {
    position
  } = useSelector(selectSimdata);
  const currentMap = useSelector(selectCurrentMap);
  const detectRetina = useSelector(selectDetectRetinaForCurrentMap);
  const isFollowing = useSelector(selectIsFollowing);
  const isWikipediaEnabled = useSelector(selectIsEnabled);
  const mapLayerVisibility = useSelector(selectMapLayerVisibility);
  const isWikipediaLayerEnabled = !!mapLayerVisibility?.wikipedia;
  const isFavoritesLayerEnabled = !!mapLayerVisibility?.favorites;
  const courseLineEnabled = useSelector(selectCourseLine);
  const isDialogOpen = !!draftFavorite || !!activeFavorite;

  const canAddFavorite = favoriteAddMode && isFavoritesLayerEnabled && !isDialogOpen;

  const favoriteIconColor = favoritesLayerDefinition?.color ?? '#f5b301';

  useEffect(() => {
    let cancelled = false;
    loadFavorites()
      .then((stored) => {
        if (!cancelled) {
          setFavorites(stored);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSaveFavorite = (name) => {
    if (!draftFavorite) return;
    const newFavorite = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `fav-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      lat: draftFavorite.lat,
      lng: draftFavorite.lng,
      createdAt: Date.now()
    };
    setFavorites((current) => {
      const next = [...current, newFavorite];
      saveFavorites(next).catch(() => {});
      return next;
    });
    setDraftFavorite(null);
  };

  const handleDeleteFavorite = (favorite) => {
    if (!favorite?.id) return;
    setFavorites((current) => {
      const next = current.filter((item) => item.id !== favorite.id);
      saveFavorites(next).catch(() => {});
      return next;
    });
    setActiveFavorite(null);
  };

  useEffect(() => {
    if (isFollowing && position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [map, isFollowing, position]);

  useEffect(() => {
    if (isWikipediaEnabled !== isWikipediaLayerEnabled) {
      dispatch(setEnabled(isWikipediaLayerEnabled));
    }
  }, [dispatch, isWikipediaEnabled, isWikipediaLayerEnabled]);

  // Recalculate map layout when sidebar (Wikipedia panel) is shown/hidden or on resize.
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    const raf = requestAnimationFrame(invalidate);
    window.addEventListener('resize', invalidate);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', invalidate);
    };
  }, [map, isWikipediaLayerEnabled]);

  return (
    <>
      <MapViewPersistence />
      <MainLayer currentMap={currentMap} detectRetina={detectRetina} />
      <DistanceScaleControl marchingSpeedKnots={marchingSpeedKnots} />
      <PointLayers />
      <FavoritesLayer
        favorites={favorites}
        enabled={isFavoritesLayerEnabled}
        canAdd={canAddFavorite}
        onRequestAdd={(coords) => setDraftFavorite(coords)}
        onSelect={(favorite) => setActiveFavorite(favorite)}
        color={favoriteIconColor}
      />
      {!!isWikipediaLayerEnabled && 
        <Wikipedia />
      }
      {!!position && !!courseLineEnabled && 
        <CourseLine />
      }
      {!!position && 
        <Plane />
      }
      {!!draftFavorite && (
        <FavoriteDialog
          mode="create"
          position={draftFavorite}
          onSave={handleSaveFavorite}
          onClose={() => setDraftFavorite(null)}
        />
      )}
      {!!activeFavorite && (
        <FavoriteDialog
          mode="view"
          favorite={activeFavorite}
          onDelete={handleDeleteFavorite}
          onClose={() => setActiveFavorite(null)}
        />
      )}
    </>
  );
}
