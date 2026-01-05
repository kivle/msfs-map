import Map from './features/map/Map';
import './App.css';
import { useSelector } from 'react-redux';
import { useLoadPreferencesEffect } from './features/map/ui/hooks';
import { selectPreferencesLoaded } from './features/map/mapSlice';
import packageJson from '../package.json';
import UpdateBanner from './components/UpdateBanner';

function App() {
  const preferencesLoaded = useSelector(selectPreferencesLoaded);
  useLoadPreferencesEffect();

  if (!preferencesLoaded) {
    return (
      <div className="App">
        <div style={{ padding: 12 }}>Loading preferences…</div>
      </div>
    );
  }

  return (
    <div className="App">
      <UpdateBanner currentVersion={packageJson.version} />
      <Map />
    </div>
  );
}

export default App;
