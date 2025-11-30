import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import store from './app/store';
import { Provider } from 'react-redux';
import { registerServiceWorker } from './registerServiceWorker';
import { ErrorBoundary } from './ErrorBoundary';

import 'leaflet/dist/leaflet.css';
import 'leaflet';

window._store = store;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

registerServiceWorker();
