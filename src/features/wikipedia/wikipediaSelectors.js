import { createSelector } from 'reselect';
import { computeDestinationPoint } from 'geolib';
import { arrayToGeolibPoint } from '../../utils/geo';

export const selectIsEnabled = (state) => state.wikipedia.isEnabled;
export const selectEdition = (state) => state.wikipedia.edition;
export const selectAvailableEditions = (state) => state.wikipedia.availableEditions;
export const selectPages = (state) => state.wikipedia.pages;
export const selectSearchRadius = (state) => state.wikipedia.searchRadius;
export const selectLastSearchPosition = (state) => state.wikipedia.lastSearchPosition;
export const selectLastSearchRadius = (state) => state.wikipedia.lastSearchRadius;
export const selectLastSearchTime = (state) => state.wikipedia.lastSearchTime;

function pageSort(a, b) {
  let res = a?.closestPoint && b?.closestPoint ? a.closestPoint.distance - b.closestPoint.distance : 0;
  if (res === 0) {
    res = a.page.title.localeCompare(b.page.title);
  }
  if (res === 0) {
    res = a.page.pageid - b.page.pageid;
  }
  return res;
}

const selectPagesState = (state) => state.wikipedia?.pages;
const selectCalculatedData = (state) => state.wikipedia?.calculatedData;
const selectPlayingPageId = (state) => state.wikipedia?.playingPageid;

export const selectPagesWithDistances = createSelector(
  [selectPagesState, selectCalculatedData, selectPlayingPageId],
  (pages, calculatedData, playingPageid) => {
    const pagesWithClosestPoints = pages?.map((p) => {
      const { closestPoint } = calculatedData[p.pageid] ?? {};

      return {
        page: p,
        closestPoint,
        isReading: playingPageid === p.pageid,
      };
    }).sort(pageSort);

    return [
      ...pagesWithClosestPoints.filter((p) => p.closestPoint?.isInFront),
      ...pagesWithClosestPoints.filter((p) => !p.closestPoint?.isInFront),
    ];
  }
);

export const selectPlayingPage = createSelector(
  [selectPagesWithDistances, selectPlayingPageId],
  (pages, playingPageid) => {
    return pages.find((p) => p.page.pageid === playingPageid);
  }
);

const selectSimdataPosition = (state) => state.simdata?.position;
const selectSimdataHeading = (state) => state.simdata?.heading;
const selectSimdataSpeed = (state) => state.simdata?.airspeed;

export const selectSearchCenterPoint = createSelector(
  [selectSimdataPosition, selectSimdataHeading, selectSimdataSpeed, selectSearchRadius],
  (position, heading, speed, searchRadius) =>
    position
      ? speed > 50
        ? computeDestinationPoint(arrayToGeolibPoint(position), searchRadius, heading)
        : arrayToGeolibPoint(position)
      : undefined
);
