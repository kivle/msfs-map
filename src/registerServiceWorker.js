export function registerServiceWorker() {
  if (import.meta?.env?.DEV) return; // avoid interfering with Vite dev/HMR
  if (!('serviceWorker' in navigator)) return;

  const base = `${window.location.origin}${import.meta.env?.BASE_URL ?? '/'}`;
  const swUrl = new URL('sw.js', base).toString();

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl).catch(() => {
      // Silently ignore registration failures; app still works online.
    });
  });
}
