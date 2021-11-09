import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateData } from "./simdataSlice";

export function useVfrmapConnection(url = "ws://localhost:9000/ws") {
  const dispatch = useDispatch();

  useEffect(() => {
    let ws = undefined;
    let closing = false;
    let timeout = undefined;

    function createConnection() {
      ws = new WebSocket(url);

      ws.onmessage = (e) => {
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
      } catch {}
    };
  }, [dispatch, url]);
}
