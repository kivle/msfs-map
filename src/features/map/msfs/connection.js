export default function connectMsfs(callback, url = "ws://localhost:9000/ws") {
  let ws = new WebSocket(url);
  
  ws.onmessage = function(e) {
    const msg = JSON.parse(e.data);
    if (msg.latitude >= 0 && msg.latitude < 0.015 && msg.longitude >= 0 && msg.longitude < 0.015) {
      // Ignore bad updates from the menu
      return;
    }
    callback(msg);
  };
  
  ws.onerror = function(e) {
    // callback(e);
  };

  ws.onclose = function(e) {
    // make sure we are closed (probably not needed)
    try { ws.close(); } catch {}
    // retry in 2 seconds
    setTimeout(() => connectMsfs(callback, url), 2000);
  }
}
