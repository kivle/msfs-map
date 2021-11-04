import * as React from "react";

import PlaneInfo from './ui/PlaneInfo';
import Wikipedia from './ui/Wikipedia';
import Preferences from './ui/Preferences';
import ButtonBar from './ui/ButtonBar';

export default function UI() {
  return (
    <div>
      <PlaneInfo />
      <Wikipedia />
      <Preferences />
      <ButtonBar />
    </div>
  );
}
