# Wikipedia virtual tour guide for MSFS 2020

The aim of this project is to provide a "virtual" tour guide that reads Wikipedia articles about the places you fly over in Microsoft Flight Simulator 2020. A video is worth more than a thousand words, so here is a video of it in action over the island of Ibiza:

https://www.youtube.com/watch?v=2rDPMjrYLFg

## Setting it up to try it yourself

This project only contains the front-end code to display the actual map and query the Wikipedia API. The actual location from the simulator is provided by a patched version of [vfrmap by lian](https://github.com/lian/msfs2020-go) . The only thing changed in the patched version is to allow cross-origin requests to the websocket.

1. Download the patched version of vfrmap from https://github.com/kivle/msfs2020-go/releases/tag/0.0.7-patched
2. Start MSFS 2020.
3. Execute patched version of vfrmap.exe
4. Open https://kivle.github.io/msfs-map/ 

Microsoft Edge is highly recommended since it provides high quality "cloud" TTS voices out of the box, but any modern browser should work.

## How to use the application

The moment the application starts to receive location data it will start querying the Wikipedia API for articles. Since it also requests excerpts of the articles, the Wikipedia API limits it to only return the 20 nearest articles at any given point. By default it will search from the center of your airplane and in a radius of 10km. The search radius can be adjusted in the settings.

In the settings you can also change the Wikipedia edition to use. All existing Wikipedia editions should be in the list, but your milage might vary if you chose editions with very few geotagged articles, etc. You should of course also chose a TTS voice for matching language you choose.

Clicking the play button (or spacebar) makes the application start reading out the current article. The moment it finishes reading, it will automatically continue on to the next article in the queue. You can pause/stop this at any moment by clicking the pause button or spacebar. If you want to skip an article you can click the next button or "n" on the keyboard.

## Rating articles to avoid "information overload"

One of the biggest challenges I've found with the English edition of Wikipedia is that you will sometimes get "information overload". Basically some areas have too many articles. A lot of articles will often be "stubs", basically only stating a village name and it's population, with little more stuff of interest in the text. Because of this I've experimented by introducing article rating. Giving up/down ratings to articles will train a Bayesian classifier, and hopefully over time low quality articles will get less priority. Articles that got a low score will show with a darker icon on the map, and they will not be read aloud. Such articles will only be shown for 5 seconds before skipping to the next, and they will only show when there are no more highly rated articles in the queue.
