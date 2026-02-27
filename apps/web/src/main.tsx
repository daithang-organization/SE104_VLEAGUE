import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { initSentry } from './lib/sentry';
import { ThemeProvider, useAntdAlgorithm } from './shell/ThemeContext';

// Initialize Sentry before rendering (no-op when VITE_SENTRY_DSN is unset)
initSentry();

/** Inner component so useAntdAlgorithm() has access to ThemeProvider */
function Root() {
  const algorithm = useAntdAlgorithm();
  return (
    <ConfigProvider theme={{ algorithm }}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  </React.StrictMode>,
);
