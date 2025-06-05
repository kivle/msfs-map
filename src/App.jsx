import React from 'react';
import Map from './features/map/Map';
import './App.css';
import { useVfrmapConnection } from './features/simdata/hooks';
import Sidebar from './features/sidebar/Sidebar';
import { useSelector } from 'react-redux';
import { selectIsEnabled } from './features/wikipedia/wikipediaSelectors';
import { useLoadPreferencesEffect } from './features/map/ui/hooks';

function App() {
  const isWikipediaEnabled = useSelector(selectIsEnabled);
  useLoadPreferencesEffect();
  useVfrmapConnection();

  return (
    <div className="App">
      <Map />
      {isWikipediaEnabled && <Sidebar />}
    </div>
  );
}

export default App;
