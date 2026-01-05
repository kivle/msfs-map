import { useEffect, useMemo, useState } from 'react';

export default function UpdateBanner({ currentVersion }) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  const versionUrl = useMemo(() => {
    const baseUrl = import.meta?.env?.BASE_URL ?? '/';
    return new URL('version.json', `${window.location.origin}${baseUrl}`);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const checkForUpdate = async () => {
      try {
        const url = new URL(versionUrl);
        url.searchParams.set('t', Date.now().toString());
        const response = await fetch(url.toString(), { cache: 'no-store' });
        if (!response.ok) return;
        const payload = await response.json();
        const version = typeof payload?.version === 'string' ? payload.version.trim() : '';
        if (!version) return;
        if (version !== currentVersion) {
          if (!cancelled) {
            setRemoteVersion(version);
            setUpdateAvailable(true);
            setDismissed(false);
          }
          return;
        }
        if (!cancelled) {
          setUpdateAvailable(false);
          setRemoteVersion(null);
        }
      } catch {
        // ignore update check errors
      }
    };

    checkForUpdate();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkForUpdate();
      }
    };
    const interval = window.setInterval(checkForUpdate, 10 * 60 * 1000);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentVersion, versionUrl]);

  const handleRefresh = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
    } catch {
      // ignore cache deletion errors
    }
    window.location.reload();
  };

  if (!updateAvailable || dismissed) {
    return null;
  }

  return (
    <div className="updateBanner" role="status" aria-live="polite">
      <div className="updateBanner__text">
        New version available{remoteVersion ? ` (${remoteVersion})` : ''}.
      </div>
      <div className="updateBanner__actions">
        <button type="button" onClick={handleRefresh}>Refresh</button>
        <button type="button" onClick={() => setDismissed(true)}>Later</button>
      </div>
    </div>
  );
}
