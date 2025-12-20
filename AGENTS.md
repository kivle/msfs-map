All agents contributing to this repository must verify their changes by running `npm run build` before committing. Run `npm install` only after pulling dependency changes or on a fresh setup; it is not required for every change.

All commits must include a well-formed, expressive commit message summarizing what changed and why.

Do not stage or commit changes unless explicitly requested by the user.

Additional findings about this project:
- Frontend uses Vite with React 19 and Redux Toolkit slices for map, simdata (websocket feed), Wikipedia, and TTS state.
- The sim connection is opened via `useSimconnectWsConnection` (default `ws://localhost:9000/ws`) and auto-reconnects; it expects the patched `simconnect-ws.exe` noted in README.
- User preferences (Wikipedia edition/enabled, voice, map, autoplay, visual overlays, shortcut mappings, websocket URL) are persisted with `localforage` in `src/utils/prefs.js` and loaded on startup via `useLoadPreferencesEffect`.
- Wikipedia lookups go through `wikipediaThunks.getPages`, which enqueues the nearest pages and immediately selects the next page to play if nothing is active; removal logic prunes far/behind pages to keep state small.
- TTS voice availability comes from `window.speechSynthesis` (see `useAvailableVoicesEffect`), so behavior depends on browser voices present on the host.
