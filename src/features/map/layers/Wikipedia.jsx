import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useMap } from "react-leaflet";
import WikipediaMarker from "./WikipediaMarker";
import { useWikipediaViewportSearch, boundsFromLeaflet } from "../../wikipedia/hooks";
import { selectPage, loadPageDetails } from "../../wikipedia/wikipediaThunks";
import {
  selectIsPageLoading,
  selectPages,
  selectSelectedPage,
  selectSelectedPageId
} from "../../wikipedia/wikipediaSelectors";
import WikipediaDetailPanel from "../../wikipedia/WikipediaDetailPanel";
import ZoomHint from "../../wikipedia/components/ZoomHint";

export default function Wikipedia() {
  const map = useMap();
  const dispatch = useDispatch();
  const pages = useSelector(selectPages);
  const selectedPageId = useSelector(selectSelectedPageId);
  const selectedPage = useSelector(selectSelectedPage);
  const isLoading = useSelector((state) => selectIsPageLoading(state, selectedPageId));

  useWikipediaViewportSearch(map);

  const triggerDetailLoad = useCallback((pageid) => {
    const bounds = map ? boundsFromLeaflet(map.getBounds()) : undefined;
    dispatch(loadPageDetails(pageid, bounds));
  }, [dispatch, map]);

  const handleSelect = useCallback((pageid) => {
    dispatch(selectPage(pageid));
  }, [dispatch]);

  useEffect(() => {
    if (selectedPageId) {
      triggerDetailLoad(selectedPageId);
    }
  }, [selectedPageId, triggerDetailLoad]);

  const handleClose = useCallback(() => {
    dispatch(selectPage(undefined));
  }, [dispatch]);

  return (
    <>
      {pages?.map((page) => (
        <WikipediaMarker
          key={page?.pageid}
          page={page}
          onClick={() => handleSelect(page?.pageid)}
        />
      ))}
      <WikipediaDetailPanel
        page={selectedPage}
        isLoading={isLoading}
        onClose={handleClose}
      />
      <ZoomHint />
    </>
  );
}
