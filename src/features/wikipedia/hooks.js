import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPagesForBounds } from "./wikipediaThunks";
import { selectEdition, selectIsEnabled } from "./wikipediaSelectors";

export function boundsFromLeaflet(leafletBounds) {
  if (!leafletBounds) return undefined;
  const ne = leafletBounds.getNorthEast().wrap();
  const sw = leafletBounds.getSouthWest().wrap();
  let east = ne.lng;
  let west = sw.lng;
  if (east < west) {
    west -= 360;
  }
  return {
    north: ne.lat,
    east,
    south: sw.lat,
    west
  };
}

export function useWikipediaViewportSearch(map, debounceMs = 1000) {
  const dispatch = useDispatch();
  const isEnabled = useSelector(selectIsEnabled);
  const edition = useSelector(selectEdition);
  const debounceRef = useRef();

  useEffect(() => {
    if (!map || !isEnabled) return;

    const trigger = () => {
      const bounds = boundsFromLeaflet(map.getBounds());
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatch(fetchPagesForBounds(bounds));
      }, debounceMs);
    };

    trigger();
    map.on('moveend', trigger);
    map.on('zoomend', trigger);
    return () => {
      clearTimeout(debounceRef.current);
      map.off('moveend', trigger);
      map.off('zoomend', trigger);
    };
  }, [map, isEnabled, dispatch, debounceMs, edition]);
}

export function useWikipediaPageLink(page) {
  const edition = useSelector(selectEdition);
  return page ? `https://${edition}.wikipedia.org/?curid=${page.pageid}` : null;
}
