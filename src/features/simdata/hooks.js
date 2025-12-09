import { useEffect } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { selectWebsocketUrl, setConnected, updateData } from "./simdataSlice";

const defaultUrl = "ws://localhost:9000/ws";

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function parseSimdataMessage(raw) {
  let msg = raw;

  if (typeof raw === "string") {
    try {
      msg = JSON.parse(raw);
    } catch (err) {
      console.warn("Failed to parse simdata message JSON", err);
      return null;
    }
  }

  if (!msg || typeof msg !== "object") {
    console.warn("Ignoring simdata message: not an object", msg);
    return null;
  }

  const {
    latitude,
    longitude,
    altitude,
    heading,
    airspeed,
    vertical_speed,
    airspeed_true,
    flaps,
    trim,
    rudder_trim
  } = msg;

  const numericFields = [
    latitude,
    longitude,
    altitude,
    heading,
    airspeed,
    vertical_speed,
    airspeed_true,
    flaps,
    trim,
    rudder_trim
  ];

  if (!numericFields.every(isFiniteNumber)) {
    console.warn("Ignoring simdata message: missing or invalid numeric fields", msg);
    return null;
  }

  if (latitude >= 0 && latitude < 0.015 && longitude >= 0 && longitude < 0.015) {
    return null;
  }

  return {
    latitude,
    longitude,
    altitude,
    heading,
    airspeed,
    vertical_speed,
    airspeed_true,
    flaps,
    trim,
    rudder_trim
  };
}

export function useVfrmapConnection() {
  const store = useStore();
  const dispatch = useDispatch();
  const websocketUrl = useSelector(selectWebsocketUrl) || defaultUrl;

  useEffect(() => {
    let ws = undefined;
    let closing = false;
    let timeout = undefined;

    function createConnection() {
      try {
        ws = new WebSocket(websocketUrl);
      } catch (err) {
        console.error("Failed to open simdata websocket", err);
        dispatch(setConnected(false));
        if (!closing) {
          timeout = setTimeout(createConnection, 2000);
        }
        return;
      }

      ws.onmessage = (e) => {
        try {
          const connected = store.getState()?.simdata?.connected;
          if (!connected) {
            dispatch(setConnected(true));
          }

          const msg = parseSimdataMessage(e.data);
          if (!msg) return;

          dispatch(updateData(msg));
        } catch (err) {
          console.warn("Failed to handle simdata message", err);
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
