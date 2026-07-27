import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

// Required: scripts/prerender.mjs injects a static crawlable snapshot into
// #root at build time. Clearing it keeps createRoot (not hydration), which
// App.tsx needs because it renders a different tree for touch vs pointer.
rootElement.replaceChildren();

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
