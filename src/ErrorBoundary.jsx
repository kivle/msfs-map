import React from 'react';
import localforage from 'localforage';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled app error', error, info);
  }

  componentDidMount() {
    this.handleWindowError = (event) => {
      const err = event?.error || event?.reason || event;
      this.setState({ hasError: true, error: err });
    };
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handleWindowError);
  }

  componentWillUnmount() {
    if (this.handleWindowError) {
      window.removeEventListener('error', this.handleWindowError);
      window.removeEventListener('unhandledrejection', this.handleWindowError);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetPrefs = async () => {
    try {
      await Promise.all([
        localforage.removeItem('currentMap'),
        localforage.removeItem('mapView')
      ]);
    } catch {
      // ignore storage errors
    }
    this.handleReload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div style={{ padding: 16, fontFamily: 'sans-serif' }}>
        <h2>Something went wrong.</h2>
        <p>The map failed to load. You can reload or reset map preferences.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={this.handleReload}>Reload</button>
          <button type="button" onClick={this.handleResetPrefs}>Reset map preferences</button>
        </div>
        <pre style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
          {this.state.error?.message || String(this.state.error)}
        </pre>
      </div>
    );
  }
}
