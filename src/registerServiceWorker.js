export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const swUrl = new URL('sw.js', import.meta.env?.BASE_URL ?? '/').toString();

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl).catch(() => {
      // Silently ignore registration failures; app still works online.
    });
  });
}
