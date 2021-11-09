import * as React from "react";
import { useSelector } from "react-redux";
import { selectCurrentPage, selectIsPlaying, selectPages } from "../../wikipedia/wikipediaSlice";
import WikipediaMarker from "./WikipediaMarker";

export default React.memo(function Wikipedia() {
  const pages = useSelector(selectPages);
  const currentPage = useSelector(selectCurrentPage);
  const isPlaying = useSelector(selectIsPlaying);

  return pages?.map(p => 
    <WikipediaMarker 
      key={p.pageid} 
      page={p} 
      isCurrentPage={p.pageid === currentPage?.pageid} 
      isPlaying={isPlaying} 
    />
  );
});
