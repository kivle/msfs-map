export const throttle = (fn, delay) => {
  let lastCalled = 0;
  return (...args) => {
    let now = new Date().getTime();
    if(now - lastCalled < delay) {
      return;
    }
    lastCalled = now;
    return fn(...args);
  }
};
