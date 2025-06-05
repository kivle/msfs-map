import React from "react";
import { useSelector } from "react-redux";
import { 
  usePeriodicWikipediaFetching, 
  usePeriodicRemoveWikipediaPagesOutOfRange, 
  usePeriodicCalculateEffect
} from "../../wikipedia/hooks";
import {
  selectPagesWithDistances,
  selectPlayingPage,
} from "../../wikipedia/wikipediaSelectors";
import {
  selectIsPlaying
} from "../../tts/ttsSlice";
import WikipediaMarker from "./WikipediaMarker";

export default function Wikipedia() {
  const pages = useSelector(selectPagesWithDistances);
  const currentPageRead = useSelector(selectPlayingPage);
  const isPlaying = useSelector(selectIsPlaying);

  usePeriodicWikipediaFetching();
  usePeriodicRemoveWikipediaPagesOutOfRange();
  usePeriodicCalculateEffect();

  return pages?.map(p => 
    <WikipediaMarker 
      key={p?.page?.pageid} 
      page={p?.page}
      isPlaying={isPlaying}
      isCurrentPage={currentPageRead?.page?.pageid === p?.page?.pageid}
    />
  );
}
