import Map from './features/map/Map';
import './App.css';
import { useSelector } from 'react-redux';
import { useLoadPreferencesEffect } from './features/map/ui/hooks';
import { selectPreferencesLoaded } from './features/map/mapSlice';

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
      <Map />
    </div>
  );
}

export default App;
