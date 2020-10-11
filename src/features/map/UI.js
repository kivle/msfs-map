import * as React from "react";

import PlaneInfo from './ui/PlaneInfo';
import Wikipedia from './ui/Wikipedia';
import Preferences from './ui/Preferences';
import Playback from './ui/Playback';

export default function UI() {
  return (
    <div>
      <PlaneInfo />
      <Wikipedia />
      <Preferences />
      <Playback />
    </div>
  );
}
