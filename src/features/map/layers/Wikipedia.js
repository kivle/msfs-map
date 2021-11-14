import React from "react";
import { useSelector } from "react-redux";
import { selectSimdata } from "../../simdata/simdataSlice";
import { usePeriodicWikipediaFetching } from "../../wikipedia/hooks";
import { 
  selectCurrentPage, selectPages, selectSearchRadius
} from "../../wikipedia/wikipediaSlice";
import {
  selectIsPlaying
} from "../../tts/ttsSlice";
import WikipediaMarker from "./WikipediaMarker";

export default function Wikipedia() {
  const pages = useSelector(selectPages);
  const currentPage = useSelector(selectCurrentPage);
  const isPlaying = useSelector(selectIsPlaying);

  const {
    position
  } = useSelector(selectSimdata);
  const searchRadius = useSelector(selectSearchRadius);

  usePeriodicWikipediaFetching(position, searchRadius);

  return pages?.map(p => 
    <WikipediaMarker 
      key={p.pageid} 
      page={p} 
      isCurrentPage={p.pageid === currentPage?.pageid} 
      isPlaying={isPlaying} 
    />
  );
}
