import { StrictMode, useState, useEffect } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary';
import { createRoot } from 'react-dom/client'
import './index.css'
import 'antd/dist/reset.css';
import App from './App.tsx'
import { App as AntApp, ConfigProvider, theme } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function ThemedAppWrapper() {
  const { dark } = useTheme();
  return (
    <ConfigProvider theme={{ algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm }}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  );
}

function RootApp() {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) {
    return <div style={{ padding: 40, textAlign: 'center', fontSize: 14 }}>Initializing UI...</div>;
  }
  return (
    <ErrorBoundary>
      <ThemedAppWrapper />
    </ErrorBoundary>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RootApp />
    </ThemeProvider>
  </StrictMode>,
)
