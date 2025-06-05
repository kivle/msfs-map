import { selectCourseLinePoint } from '../mapSlice';

const baseState = {
  map: {},
  simdata: {
    position: [0, 0],
    heading: 0
  }
};

describe('map selectors', () => {
  const emptyState = { map: {}, simdata: {} };

  it('returns undefined when no position', () => {
    expect(selectCourseLinePoint(emptyState)).toBeUndefined();
  });

  it('calculates course line points', () => {
    const points = selectCourseLinePoint(baseState);
    expect(points.length).toBe(21);
    expect(points[0]).toEqual([0,0]);
  });
});
