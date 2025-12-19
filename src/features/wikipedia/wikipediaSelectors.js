import { createSelector } from 'reselect';
import { computeDestinationPoint } from 'geolib';
import { arrayToGeolibPoint } from '../../utils/geo';

export const selectIsEnabled = (state) => state.wikipedia.isEnabled;
export const selectEdition = (state) => state.wikipedia.edition;
export const selectAvailableEditions = (state) => state.wikipedia.availableEditions;
export const selectPages = (state) => state.wikipedia.pages ?? [];
export const selectSearchRadius = (state) => state.wikipedia.searchRadius;
export const selectLastSearchBounds = (state) => state.wikipedia.lastSearchBounds;
export const selectSelectedPageId = (state) => state.wikipedia.selectedPageId;
export const selectNeedsMoreZoom = (state) => state.wikipedia.needsMoreZoom;

const selectPagesState = (state) => state.wikipedia?.pages ?? [];
const selectPageDetailsState = (state) => state.wikipedia?.pageDetails ?? {};
const selectLoadingState = (state) => state.wikipedia?.loadingPageDetails ?? {};

const selectPosition = (state) => state.simdata?.position;
const selectHeading = (state) => state.simdata?.heading;
const selectSpeed = (state) => state.simdata?.airspeed;

export const selectSearchCenterPoint = createSelector(
  [selectPosition, selectHeading, selectSpeed, selectSearchRadius],
  (position, heading, speed, searchRadius) =>
    position
      ? speed > 50
        ? computeDestinationPoint(arrayToGeolibPoint(position), searchRadius, heading)
        : arrayToGeolibPoint(position)
      : undefined
);

export const selectPageById = createSelector(
  [selectPagesState, (_, pageid) => pageid],
  (pages, pageid) => pages.find((p) => p.pageid === pageid)
);

export const selectPageDetailsById = createSelector(
  [selectPageDetailsState, (_, pageid) => pageid],
  (details, pageid) => (pageid ? details[pageid] : undefined)
);

export const selectIsPageLoading = createSelector(
  [selectLoadingState, (_, pageid) => pageid],
  (loading, pageid) => !!(pageid && loading?.[pageid])
);

export const selectSelectedPage = createSelector(
  [selectPagesState, selectPageDetailsState, selectSelectedPageId],
  (pages, details, selectedPageId) => {
    if (!selectedPageId) return undefined;
    const base = pages.find((p) => p.pageid === selectedPageId) ?? {};
    return {
      ...base,
      ...(details[selectedPageId] ?? {})
    };
  }
);
