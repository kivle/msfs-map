import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { selectWebsocketUrl, setConnected, updateData } from "./simdataSlice";

const defaultUrl = "ws://localhost:9000/ws";

export function useVfrmapConnection() {
  const store = useStore();
  const dispatch = useDispatch();
  const websocketUrl = useSelector(selectWebsocketUrl) || defaultUrl;

  useEffect(() => {
    let ws = undefined;
    let closing = false;
    let timeout = undefined;

    function createConnection() {
      ws = new WebSocket(websocketUrl);

      ws.onmessage = (e) => {
        const connected = store.getState()?.simdata?.connected;
        if (!connected) {
          dispatch(setConnected(true));
        }

        try {
          const msg = JSON.parse(e.data);
          if (msg.latitude >= 0 && msg.latitude < 0.015 && msg.longitude >= 0 && msg.longitude < 0.015) {
            return;
          }
          dispatch(updateData(msg));
        } catch (err) {
          console.warn('Failed to parse simdata message', err);
        }
      };
      
      ws.onerror = (event) => {
        // Suppress noisy console errors when vfrmap.exe is not running; preventDefault keeps the error from bubbling
        try {
          event?.preventDefault?.();
        } catch {}
      };

      ws.onclose = (e) => {
        dispatch(setConnected(false));
        if (!closing) {
          timeout = setTimeout(createConnection, 2000);
        }
      };
    }

    createConnection();

    return () => {
      try {
        clearTimeout(timeout);
        closing = true;
        ws.close(); 
        ws = undefined;
        dispatch(setConnected(false));
      } catch {}
    };
  }, [dispatch, store, websocketUrl]);
}
