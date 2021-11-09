import React from 'react';
import Map from './features/map/Map';
import './App.css';
import { useVfrmapConnection } from './features/simdata/hooks';

function App() {
  useVfrmapConnection();

  return (
    <div className="App">
      <Map />
    </div>
  );
}

export default App;
