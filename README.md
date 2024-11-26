# Wikipedia virtual tour guide for MSFS 2020/2024

NOTE: A new patched version of vfrmap.exe is required for MSFS 2024. Download from the release page below!

The aim of this project is to provide a "virtual" tour guide that reads Wikipedia articles about the places you fly over in Microsoft Flight Simulator 2020/2024. A video is worth more than a thousand words, so here is a video of it in action over the island of Ibiza:

https://www.youtube.com/watch?v=2rDPMjrYLFg

## Setting it up to try it yourself

This project only contains the front-end code to display the actual map and query the Wikipedia API. The actual location from the simulator is provided by a patched version of [vfrmap by lian](https://github.com/lian/msfs2020-go) . The only thing changed in the patched version is to allow cross-origin requests to the websocket.

1. Download the patched version of vfrmap (separate version for MSFS 2024 has been added!) from https://github.com/kivle/msfs2020-go/releases/tag/0.0.7-patched
2. Start MSFS 2020.
3. Execute patched version of vfrmap.exe
4. Open https://kivle.github.io/msfs-map/ 

Microsoft Edge is highly recommended since it provides high quality "cloud" TTS voices out of the box, but any modern browser should work.

## How to use the application

The moment the application starts to receive location data it will start querying the Wikipedia API for articles. Since it also requests excerpts of the articles, the Wikipedia API limits it to only return the 20 nearest articles at any given point. By default it will search from the center of your airplane and in a radius of 10km. The search radius can be adjusted in the settings.

In the settings you can also change the Wikipedia edition to use. All existing Wikipedia editions should be in the list, but your milage might vary if you chose editions with very few geotagged articles, etc. You should of course also chose a TTS voice for matching language you choose.

Clicking the play button (or spacebar) makes the application start reading out the current article. The moment it finishes reading, it will automatically continue on to the next article in the queue. You can pause/stop this at any moment by clicking the pause button or spacebar. If you want to skip an article you can click the next button or "n" on the keyboard.

It is also possible to map certain actions to gamepad controllers in the preferences. This allows the map to be zoomed, play/pause to be clicked and skipping articles to be done without leaving the sim. Note that there are some limitations in the gamepad apis of web browsers. A gamepad can have at a maximum 32 buttons, so certain throttle quadrants that have even more buttons than this might not work.

## Running the map on a different computer / device on the network

It's possible to run the map on a different device than the computer running the simulator. To do this, vfrmap.exe still needs to be started on the computer running the sim. On the other device, open the map and go to preferences. You will need to put in the full websocket url to the computer running vfrmap.exe. For instance "ws://192.168.50.123:9000/ws". If you do not know the local ip address of the computer running the simulator, you can open a command prompt and type "ipconfig" to find it.
