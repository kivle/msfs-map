export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const cleanup = async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    } catch (err) {
      console.warn('Failed to unregister service workers', err);
    }

    // Clear caches left by previous service worker runs so the browser cache is the only layer.
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    } catch (err) {
      console.warn('Failed to clear service worker caches', err);
    }
  };

  if (document.readyState === 'complete') {
    cleanup();
  } else {
    window.addEventListener('load', cleanup, { once: true });
  }
}
