import { getDistance } from 'geolib';
import repository from './repository';
import {
  receivePages,
  removePages,
  receivePageDetails,
  setLastSearchBounds,
  setNeedsMoreZoom,
  setSelectedPageId,
  startLoadingPageDetail,
} from './wikipediaSlice';
import {
  selectEdition,
  selectIsEnabled,
  selectLastSearchBounds,
  selectPageDetailsById,
  selectPages,
} from './wikipediaSelectors';

const MAX_RESULTS = 30;
const MAX_BBOX_SPAN_DEGREES = 0.5;

function boundsCenter(bbox) {
  if (!bbox) return undefined;
  const { north, east, south, west } = bbox;
  return {
    latitude: (north + south) / 2,
    longitude: (east + west) / 2
  };
}

function boundsArea(bbox) {
  if (!bbox) return 0;
  const { north, east, south, west } = bbox;
  return Math.max(0, north - south) * Math.max(0, east - west);
}

function intersectionArea(a, b) {
  if (!a || !b) return 0;
  const north = Math.min(a.north, b.north);
  const south = Math.max(a.south, b.south);
  const east = Math.min(a.east, b.east);
  const west = Math.max(a.west, b.west);
  if (north <= south || east <= west) return 0;
  return (north - south) * (east - west);
}

function overlapRatio(newBounds, oldBounds) {
  const newArea = boundsArea(newBounds);
  if (!newArea) return 0;
  const inter = intersectionArea(newBounds, oldBounds);
  return inter / newArea;
}

function normalizeGeosearchResults(geoResults, bbox) {
  const center = boundsCenter(bbox);
  const normalized = (geoResults ?? []).map((item) => {
    const lat = item?.lat ?? item?.latitude;
    const lon = item?.lon ?? item?.lng ?? item?.longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    const distance = center && lat !== undefined && lon !== undefined
      ? getDistance(center, { latitude: lat, longitude: lon })
      : undefined;
    return {
      pageid: item.pageid,
      title: item.title,
      coordinates: [[lat, lon]],
      distance
    };
  }).filter((p) => p && p.pageid && p.coordinates?.[0]);

  normalized.sort((a, b) => {
    const ad = a.distance ?? Number.MAX_SAFE_INTEGER;
    const bd = b.distance ?? Number.MAX_SAFE_INTEGER;
    if (ad === bd) return a.title.localeCompare(b.title);
    return ad - bd;
  });

  return normalized.slice(0, MAX_RESULTS);
}

export const fetchPagesForBounds = (bounds) => async (dispatch, getState) => {
  const state = getState();
  if (!selectIsEnabled(state)) return;
  if (!bounds) return;

  const latSpan = Math.abs(bounds.north - bounds.south);
  const lonSpan = Math.abs(bounds.east - bounds.west);
  if (latSpan > MAX_BBOX_SPAN_DEGREES || lonSpan > MAX_BBOX_SPAN_DEGREES) {
    dispatch(receivePages({ pages: [], bounds: undefined }));
    dispatch(setLastSearchBounds(undefined));
    dispatch(setNeedsMoreZoom(true));
    return;
  }

  const clampedBounds = clampBounds(bounds);
  if (!clampedBounds) return;

  const previousBounds = selectLastSearchBounds(state);
  if (shouldSkipSearch(clampedBounds, previousBounds)) {
    return;
  }

  const edition = selectEdition(state);
  try {
    const geosearch = await repository.getPagesByBoundingBox(edition, clampedBounds, MAX_RESULTS);
    const pages = normalizeGeosearchResults(geosearch, clampedBounds);
    dispatch(receivePages({ pages, bounds: clampedBounds }));
    dispatch(setLastSearchBounds(clampedBounds));
    dispatch(setNeedsMoreZoom(false));
  } catch (e) {
    console.error('Failed to fetch Wikipedia pages', e);
  }
};

function clampBounds(bounds, maxSpan = 0.5) {
  if (!bounds) return null;
  const normalizeLon = (lon) => {
    const wrapped = ((lon + 180) % 360 + 360) % 360 - 180;
    return wrapped === -180 ? 180 : wrapped;
  };

  const north = Math.min(85, Math.max(-85, bounds.north));
  const south = Math.min(85, Math.max(-85, bounds.south));
  const east = normalizeLon(bounds.east);
  const west = normalizeLon(bounds.west);

  const centerLat = (north + south) / 2;
  const centerLon = normalizeLon((east + west) / 2);
  const halfLat = Math.min(maxSpan / 2, Math.max(0.01, Math.abs(north - south) / 2));
  const halfLon = Math.min(maxSpan / 2, Math.max(0.01, Math.abs(east - west) / 2));
  return {
    north: centerLat + halfLat,
    south: centerLat - halfLat,
    east: centerLon + halfLon,
    west: centerLon - halfLon
  };
}

function shouldSkipSearch(current, previous) {
  if (!current || !previous) return false;
  const overlap = overlapRatio(current, previous);
  if (overlap <= 0.8) return false;

  const currentCenter = boundsCenter(current);
  const previousCenter = boundsCenter(previous);
  if (!currentCenter || !previousCenter) return false;

  const centerDistance = getDistance(currentCenter, previousCenter);
  // If the centers are effectively the same (<5km) and high overlap, skip.
  return centerDistance < 5000;
}

export const loadPageDetails = (pageid, bounds) => async (dispatch, getState) => {
  if (!pageid) return;
  const state = getState();
  if (selectPageDetailsById(state, pageid)) return;
  dispatch(startLoadingPageDetail(pageid));
  const edition = selectEdition(state);
  try {
    // Fetch basic details first to show text quickly
    const basePages = await repository.getPageDetailsByIds(edition, [pageid], bounds, false);
    if (basePages) {
      dispatch(receivePageDetails({ pages: basePages, pageids: [pageid] }));
    }
    // Fetch enriched details (images) in the background
    const pages = await repository.getPageDetailsByIds(edition, [pageid], bounds, true);
    if (pages) {
      dispatch(receivePageDetails({ pages, pageids: [pageid] }));
    }
  } catch (e) {
    console.error('Failed to load Wikipedia page details', e);
    dispatch(receivePageDetails({ pages: {}, pageids: [pageid] }));
  }
};

export const dismissPagesOutsideViewport = () => (dispatch, getState) => {
  const pages = selectPages(getState());
  const toRemove = pages.slice(MAX_RESULTS);
  if (toRemove.length) {
    dispatch(removePages({ pageids: toRemove.map((p) => p.pageid) }));
  }
};

export const selectPage = (pageid) => (dispatch) => {
  dispatch(setSelectedPageId(pageid));
};
