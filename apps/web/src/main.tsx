import { ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './auth/AuthContext';
import { ErrorBoundary } from './components';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConfigProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ConfigProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
