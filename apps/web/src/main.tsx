import { ConfigProvider, message } from 'antd';
import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import './index.css';
import './lib/i18n'; // Initialize i18n (side-effect)
import { initSentry } from './lib/sentry';
import { ThemeProvider, useAntdThemeConfig } from './shell/ThemeContext';

// Initialize Sentry before rendering (no-op when VITE_SENTRY_DSN is unset)
initSentry();

message.config({
  duration: 3.8,
  maxCount: 4,
  top: 72,
});

/** Inner component so useAntdAlgorithm() has access to ThemeProvider */
function Root() {
  const themeConfig = useAntdThemeConfig();
  return (
    <ConfigProvider theme={themeConfig}>
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
