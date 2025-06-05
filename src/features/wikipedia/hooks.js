import { getDistance } from "geolib";
import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { selectSimdata } from "../simdata/simdataSlice";
import { clearPagesOutOfRange, getPages } from "./wikipediaThunks";
import {
  selectEdition,
  selectIsEnabled,
  selectLastSearchPosition,
  selectLastSearchRadius,
  selectLastSearchTime,
  selectSearchCenterPoint,
  selectSearchRadius,
} from "./wikipediaSelectors";
import { updateCalculatedData } from "./wikipediaSlice";

export function usePeriodicWikipediaFetching(minimumInterval = 20000) {
  const dispatch = useDispatch();
  const isEnabled = useSelector(selectIsEnabled);
  const lastSearchPosition = useSelector(selectLastSearchPosition);
  const lastSearchRadius = useSelector(selectLastSearchRadius);
  const lastSearchTime = useSelector(selectLastSearchTime);
  const searchRadius = useSelector(selectSearchRadius);
  const searchCenterPoint = useSelector(selectSearchCenterPoint);

  useEffect(() => {
    if (!searchCenterPoint || !isEnabled) return;

    const searchCenterPointArray = [searchCenterPoint.latitude ?? 0, searchCenterPoint.longitude ?? 0];
    const positionChanged = 
      !lastSearchPosition || 
      getDistance(searchCenterPoint, { latitude: lastSearchPosition[0], longitude: lastSearchPosition[1] }) > 1000;
    const timeSinceLastSearch = new Date().getTime() - (lastSearchTime ?? 0);
    // console.log('position changed', positionChanged, 'time since last search', timeSinceLastSearch);
    if (positionChanged && timeSinceLastSearch > minimumInterval) {
      dispatch(getPages(searchCenterPointArray[0], searchCenterPointArray[1], searchRadius));
    }
  },
  [
    dispatch, isEnabled, 
    searchCenterPoint, lastSearchPosition,
    searchRadius, lastSearchRadius, 
    lastSearchTime, minimumInterval
  ]);
}

export function usePeriodicRemoveWikipediaPagesOutOfRange() {
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(clearPagesOutOfRange());
    }, 30000);
    return () => {
      clearInterval(interval);
    };
  }, [dispatch]);
}

export function usePeriodicCalculateEffect() {
  const dispatch = useDispatch();
  const store = useStore();

  useEffect(() => {
    const interval = setInterval(() => {
      const {
        position,
        heading
      } = selectSimdata(store.getState());
      dispatch(updateCalculatedData({ position, heading, currentTime: new Date().getTime() }));
    }, 250);
    return () => {
      clearInterval(interval);
    };
  }, [dispatch, store]);
}

export function useWikipediaPageLink(page) {
  const edition = useSelector(selectEdition);
  return page ? `https://${edition}.wikipedia.org/?curid=${page.pageid}` : null;
}
