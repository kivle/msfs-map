import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  clearPagesOutOfRange,
  getPages,
  selectEdition,
  selectIsEnabled,
  selectLastSearchPosition, selectLastSearchRadius, selectLastSearchTime, selectSearchCenterPoint 
} from "./wikipediaSlice";

export function usePeriodicWikipediaFetching(position, searchRadius, minimumInterval = 20000) {
  const dispatch = useDispatch();
  const isEnabled = useSelector(selectIsEnabled);
  const lastSearchPosition = useSelector(selectLastSearchPosition);
  const lastSearchRadius = useSelector(selectLastSearchRadius);
  const lastSearchTime = useSelector(selectLastSearchTime);
  const searchCenterPoint = useSelector(selectSearchCenterPoint);

  useEffect(() => {
    if (!searchCenterPoint || !isEnabled) return;

    const searchCenterPointArray = [searchCenterPoint.latitude ?? 0, searchCenterPoint.longitude ?? 0];
    const positionChanged = searchCenterPointArray?.[0] !== lastSearchPosition?.[0] || searchCenterPointArray?.[1] !== lastSearchPosition?.[1];
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

export function useWikipediaPageLink(page) {
  const edition = useSelector(selectEdition);
  return page ? `https://${edition}.wikipedia.org/?curid=${page.pageid}` : null;
}
