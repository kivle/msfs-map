import React from "react";
import { useSelector } from "react-redux";
import { selectSimdata } from "../../simdata/simdataSlice";
import { usePeriodicWikipediaFetching, usePeriodicRemoveWikipediaPagesOutOfRange } from "../../wikipedia/hooks";
import { 
  selectPagesWithDistances, selectPlayQueue, selectSearchRadius
} from "../../wikipedia/wikipediaSlice";
import {
  selectIsPlaying
} from "../../tts/ttsSlice";
import WikipediaMarker from "./WikipediaMarker";

export default function Wikipedia() {
  const pages = useSelector(selectPagesWithDistances);
  const currentPageRead = useSelector(selectPlayQueue)?.[0];
  const isPlaying = useSelector(selectIsPlaying);

  const {
    position
  } = useSelector(selectSimdata);
  const searchRadius = useSelector(selectSearchRadius);

  usePeriodicWikipediaFetching(position, searchRadius);
  usePeriodicRemoveWikipediaPagesOutOfRange();

  return pages?.map(p => 
    <WikipediaMarker 
      key={p.pageid} 
      page={p}
      isPlaying={isPlaying}
      isCurrentPage={currentPageRead?.pageid === p?.pageid}
    />
  );
}
