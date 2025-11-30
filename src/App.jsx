import Map from './features/map/Map';
import './App.css';
import { useVfrmapConnection } from './features/simdata/hooks';
import { Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import { selectIsEnabled } from './features/wikipedia/wikipediaSelectors';
import { useLoadPreferencesEffect } from './features/map/ui/hooks';
import { selectPreferencesLoaded } from './features/map/mapSlice';

const Sidebar = lazy(() => import('./features/sidebar/Sidebar'));

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
      {isWikipediaEnabled && (
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
      )}
    </div>
  );
}

export default App;
