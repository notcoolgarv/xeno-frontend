import React from 'react';

interface State { hasError: boolean; error: Error | null; info: React.ErrorInfo | null }

export class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, info: null };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error('App ErrorBoundary caught error', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace' }}>
          <h3 style={{ marginTop: 0 }}>Something went wrong.</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#222', color: '#fff', padding: 12, borderRadius: 4 }}>
{this.state.error?.message}\n\n{this.state.info?.componentStack}
          </pre>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
