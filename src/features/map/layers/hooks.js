import { useMemo } from "react";
import ReactDOMServer from "react-dom/server";
import L from 'leaflet';

export function useLeafletIcon(jsx, zoom = "100%", size = [100, 50]) {
  const html = useMemo(() => ReactDOMServer.renderToString(jsx), [jsx]);

  return L.divIcon({
    className: "dummy",
    iconSize: size,
    html: `
    <div style="zoom:${zoom};overflow:visible">
      ${html}
    </div>`
  });
}
