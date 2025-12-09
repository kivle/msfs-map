* Change (re)connection logic for websockets to not be spammy (rate limited on ipads)
* Move zoom in/out to bottom right (better on ipad/touch screens)
* Update documentation for new/rebranded vfrmap (simconnect-ws)
* Move selection of base map layer (raster/vector dropdwon) over to the dedicated map layers section
* Change preference for ws:// url to instead default to wss:// and port 9443 when configuring for anything but localhost/127.0.0.1
* Consider using ground_heading or ground_course for the heading line instead of the normal heading
//* Crashes when parsing errors/unrecognized frame types from websocket
//* Crashes when security exceptions (trying to connect to ws:// url over network)
//* Attribution status line is waaay to long now (move to popup instead)
//* Add new items to sim status bar (gps course, gps speed, etc)
//* Less (no) caching in service worker to help with refreshing changes in the PWA
//* DistanceScaleControl should be moved out of MapContent file