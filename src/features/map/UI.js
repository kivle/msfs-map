import * as React from "react";

import PlaneInfo from './ui/PlaneInfo';
import Preferences from './ui/Preferences';
import ButtonBar from './ui/ButtonBar';

export default function UI() {
  return (
    <div>
      <PlaneInfo />
      <Preferences />
      <ButtonBar />
    </div>
  );
}
