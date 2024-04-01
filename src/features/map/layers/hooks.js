import { useMemo } from "react";
import ReactDOMServer from "react-dom/server";

export function useLeafletIcon(jsx, zoom = "100%") {
  const html = useMemo(() => {
    return ReactDOMServer.renderToString(jsx);
  }, [jsx]);

  return L.divIcon({
    className: "dummy",
    iconSize: [100, 50],
    html: `
    <div style="zoom:${zoom};overflow:visible">
      ${html}
    </div>`
  });
}
