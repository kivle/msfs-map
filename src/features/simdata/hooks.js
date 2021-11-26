import { useEffect } from "react";
import { useDispatch, useStore } from "react-redux";
import { setConnected, updateData } from "./simdataSlice";

export function useVfrmapConnection(url = "ws://localhost:9000/ws") {
  const store = useStore();
  const dispatch = useDispatch();

  useEffect(() => {
    let ws = undefined;
    let closing = false;
    let timeout = undefined;

    function createConnection() {
      ws = new WebSocket(url);

      ws.onmessage = (e) => {
        const connected = store.getState().simdata.connected;
        if (!connected) {
          dispatch(setConnected(true));
        }
        
        const msg = JSON.parse(e.data);
        if (msg.latitude >= 0 && msg.latitude < 0.015 && msg.longitude >= 0 && msg.longitude < 0.015) {
          return;
        }
        dispatch(updateData(msg));
      };
      
      ws.onerror = (e) => {
        console.debug(e);
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
  }, [dispatch, url, store]);
}
