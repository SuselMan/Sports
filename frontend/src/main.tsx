import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { installHealthExport } from './offline/healthExport';
import './i18n';
import './styles/uikit-colors.css';

if (!(window as any).KektrackNative) registerSW({
  immediate: true,
});

installHealthExport();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
