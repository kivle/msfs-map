import React from "react";
import { useSelector } from "react-redux";
import { 
  usePeriodicWikipediaFetching, 
  usePeriodicRemoveWikipediaPagesOutOfRange, 
  usePeriodicCalculateEffect
} from "../../wikipedia/hooks";
import {
  selectPagesWithDistances
} from "../../wikipedia/wikipediaSelectors";
import WikipediaMarker from "./WikipediaMarker";

export default function Wikipedia() {
  const pages = useSelector(selectPagesWithDistances);

  usePeriodicWikipediaFetching();
  usePeriodicRemoveWikipediaPagesOutOfRange();
  usePeriodicCalculateEffect();

  return pages?.map(p => 
    <WikipediaMarker 
      key={p?.page?.pageid} 
      page={p?.page}
    />
  );
}
