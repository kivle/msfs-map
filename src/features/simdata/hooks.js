import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { selectWebsocketUrl, setConnected, updateData } from "./simdataSlice";

const defaultUrl = "ws://localhost:9000/ws";

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isNullableFiniteNumber(value) {
  return value === null || value === undefined || isFiniteNumber(value);
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

  // vfrmap/simconnect-ws payloads use the field names shown in the sample frame; coerce numeric strings.
  const toNumber = (value) => {
    if (value === undefined || value === null) return value;
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  };

  const latitude = toNumber(msg.latitude);
  const longitude = toNumber(msg.longitude);
  const altitude = toNumber(msg.altitude);
  const heading = toNumber(msg.heading);
  const airspeed = toNumber(msg.airspeed);
  const vertical_speed = toNumber(msg.vertical_speed);
  const airspeed_true = toNumber(msg.airspeed_true);
  const flaps = toNumber(msg.flaps);
  const trim = toNumber(msg.trim);
  const rudder_trim = toNumber(msg.rudder_trim);
  const ground_heading = toNumber(msg.ground_heading);
  const ground_course = toNumber(msg.ground_course);
  const ground_speed = toNumber(msg.ground_speed);

  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) {
    console.warn("Ignoring simdata message: missing latitude/longitude", msg);
    return null;
  }

  const numericFields = {
    altitude,
    heading,
    airspeed,
    vertical_speed,
    airspeed_true,
    flaps,
    trim,
    rudder_trim,
    ground_heading,
    ground_course,
    ground_speed
  };

  const hasInvalidOptional = Object.values(numericFields).some((value) => !isNullableFiniteNumber(value));
  if (hasInvalidOptional) {
    console.warn("Ignoring simdata message: invalid numeric fields", msg);
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
    rudder_trim,
    ground_heading,
    ground_course,
    ground_speed
  };
}

export function useVfrmapConnection() {
  const store = useStore();
  const dispatch = useDispatch();
  const websocketUrl = useSelector(selectWebsocketUrl) || defaultUrl;
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const websocketRef = useRef(null);
  const manuallyClosedSockets = useRef(new WeakSet());

  const clearError = useCallback(() => setError(null), []);

  const disconnect = useCallback(() => {
    const socket = websocketRef.current;
    if (socket) {
      manuallyClosedSockets.current.add(socket);
      try {
        socket.close();
      } catch {}
    }
    websocketRef.current = null;
    setStatus("idle");
    setError(null);
    dispatch(setConnected(false));
  }, [dispatch]);

  useEffect(() => () => disconnect(), [disconnect]);

  const connect = useCallback(() => {
    if (status === "connecting") return;

    setError(null);

    const existingSocket = websocketRef.current;
    if (existingSocket) {
      manuallyClosedSockets.current.add(existingSocket);
      try {
        existingSocket.close();
      } catch {}
      websocketRef.current = null;
      dispatch(setConnected(false));
    }

    setStatus("connecting");

    let socket;
    try {
      socket = new WebSocket(websocketUrl);
    } catch (err) {
      setStatus("idle");
      dispatch(setConnected(false));
      setError(err?.message || "Unable to open websocket connection.");
      return;
    }

    websocketRef.current = socket;

    socket.onopen = () => {
      if (websocketRef.current !== socket) return;
      setStatus("connected");
      setError(null);
      dispatch(setConnected(true));
    };

    socket.onmessage = (e) => {
      if (websocketRef.current !== socket) return;
      try {
        const msg = parseSimdataMessage(e.data);
        if (!msg) return;

        dispatch(updateData(msg));
        const connected = store.getState()?.simdata?.connected;
        if (!connected) {
          dispatch(setConnected(true));
        }
      } catch (err) {
        console.warn("Failed to handle simdata message", err);
      }
    };
    
    socket.onerror = (event) => {
      if (websocketRef.current !== socket) return;
      // Suppress noisy console errors when vfrmap.exe is not running; preventDefault keeps the error from bubbling
      try {
        event?.preventDefault?.();
      } catch {}

      const message = event?.message || "Connection error. Verify the simulator bridge is running.";
      setError(message);
    };

    socket.onclose = (event) => {
      const isCurrentSocket = websocketRef.current === socket;
      const wasManual = manuallyClosedSockets.current.has(socket);
      manuallyClosedSockets.current.delete(socket);
      if (!isCurrentSocket) return;

      websocketRef.current = null;
      dispatch(setConnected(false));
      setStatus("idle");

      if (!wasManual) {
        const reason = event?.reason?.trim();
        const code = event?.code;
        const message = reason || (code ? `Connection closed (code ${code}).` : "Connection closed.");
        if (message) setError(message);
      }
    };
  }, [dispatch, status, store, websocketUrl]);

  return {
    connect,
    disconnect,
    clearError,
    status,
    error,
    websocketUrl
  };
}
