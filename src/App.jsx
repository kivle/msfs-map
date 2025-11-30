import Map from './features/map/Map';
import './App.css';
import { useVfrmapConnection } from './features/simdata/hooks';
import Sidebar from './features/sidebar/Sidebar';
import { useSelector } from 'react-redux';
import { selectIsEnabled } from './features/wikipedia/wikipediaSelectors';
import { useLoadPreferencesEffect } from './features/map/ui/hooks';
import { selectPreferencesLoaded } from './features/map/mapSlice';

function App() {
  const isWikipediaEnabled = useSelector(selectIsEnabled);
  const preferencesLoaded = useSelector(selectPreferencesLoaded);
  useLoadPreferencesEffect();
  useVfrmapConnection();

  if (!preferencesLoaded) {
    return (
      <div className="App">
        <div style={{ padding: 12 }}>Loading preferences…</div>
      </div>
    );
  }

  return (
    <div className="App">
      <Map />
      {isWikipediaEnabled && <Sidebar />}
    </div>
  );
}

export default App;
