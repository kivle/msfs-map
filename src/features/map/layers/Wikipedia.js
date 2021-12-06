import React from "react";
import { useSelector } from "react-redux";
import { 
  usePeriodicWikipediaFetching, 
  usePeriodicRemoveWikipediaPagesOutOfRange, 
  useAutoPlayEffect,
  usePeriodicCalculateEffect
} from "../../wikipedia/hooks";
import { 
  selectPagesWithDistances, selectPlayQueue
} from "../../wikipedia/wikipediaSlice";
import {
  selectIsPlaying
} from "../../tts/ttsSlice";
import WikipediaMarker from "./WikipediaMarker";

export default function Wikipedia() {
  const pages = useSelector(selectPagesWithDistances);
  const currentPageRead = useSelector(selectPlayQueue)?.[0];
  const isPlaying = useSelector(selectIsPlaying);

  usePeriodicWikipediaFetching();
  usePeriodicRemoveWikipediaPagesOutOfRange();
  useAutoPlayEffect();
  usePeriodicCalculateEffect();

  return pages?.map(p => 
    <WikipediaMarker 
      key={p?.page?.pageid} 
      page={p?.page}
      isInPlayQueue={p?.isInPlayQueue}
      isPlaying={isPlaying}
      isCurrentPage={currentPageRead?.page?.pageid === p?.page?.pageid}
    />
  );
}
