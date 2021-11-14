import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  getPages,
  selectEdition,
  selectIsEnabled,
  selectLastSearchPosition, selectLastSearchRadius, selectLastSearchTime 
} from "./wikipediaSlice";

export function usePeriodicWikipediaFetching(position, searchRadius, minimumInterval = 20000) {
  const dispatch = useDispatch();
  const isEnabled = useSelector(selectIsEnabled);
  const lastSearchPosition = useSelector(selectLastSearchPosition);
  const lastSearchRadius = useSelector(selectLastSearchRadius);
  const lastSearchTime = useSelector(selectLastSearchTime);

  useEffect(() => {
    if (!position || !isEnabled) return;

    const positionChanged = position?.[0] !== lastSearchPosition?.[0] || position?.[1] !== lastSearchPosition?.[1];
    const searchRadiusChanged = searchRadius !== lastSearchRadius;
    const timeSinceLastSearch = new Date().getTime() - lastSearchTime;

    if ((positionChanged && timeSinceLastSearch > minimumInterval) || searchRadiusChanged) {
      dispatch(getPages(position[0], position[1], searchRadius));
    }
  },
  [
    dispatch, isEnabled, 
    position, lastSearchPosition,
    searchRadius, lastSearchRadius, 
    lastSearchTime, minimumInterval
  ]);
}

export function useWikipediaPageLink(page) {
  const edition = useSelector(selectEdition);
  return page ? `https://${edition}.wikipedia.org/?curid=${page.pageid}` : null;
}
