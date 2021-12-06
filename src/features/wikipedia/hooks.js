import { getDistance } from "geolib";
import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { selectSimdata } from "../simdata/simdataSlice";
import { 
  addToPlayQueue,
  clearPagesOutOfRange,
  getPages,
  selectAutoPlay,
  selectAutoPlayDistance,
  selectEdition,
  selectIsEnabled,
  selectLastSearchPosition,
  selectLastSearchRadius,
  selectLastSearchTime,
  selectPagesWithDistances,
  selectSearchCenterPoint, 
  selectSearchRadius,
  updateCalculatedData
} from "./wikipediaSlice";

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
      getDistance(searchCenterPoint, { latitude: lastSearchPosition[0], longitude: lastSearchPosition[1] }) > 100;
    const searchRadiusChanged = searchRadius !== lastSearchRadius;
    const timeSinceLastSearch = new Date().getTime() - lastSearchTime;

    if ((positionChanged && timeSinceLastSearch > minimumInterval) || searchRadiusChanged) {
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

export function useAutoPlayEffect() {
  const dispatch = useDispatch();
  const autoPlay = useSelector(selectAutoPlay);
  const autoPlayDistance = useSelector(selectAutoPlayDistance);
  const pages = useSelector(selectPagesWithDistances);

  useEffect(() => {
    if (!autoPlay || !pages) return;
    const pagesToQueue = pages.filter(
      page => page.closestPoint?.distance < autoPlayDistance
           && !page.isInPlayQueue
    );
    for (const page of pagesToQueue) {
      dispatch(addToPlayQueue({ pageid: page.page.pageid }));
    }
  }, [dispatch, autoPlay, autoPlayDistance, pages]);
}

export function useWikipediaPageLink(page) {
  const edition = useSelector(selectEdition);
  return page ? `https://${edition}.wikipedia.org/?curid=${page.pageid}` : null;
}
