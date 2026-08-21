import React from 'react';
import ReactDOM from 'react-dom/client';
import WallpapersApp from '../WallpapersApp';
import { startPageAnalytics } from '../lib/analytics';
import '../index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

// Matches index.tsx: scripts/prerender.mjs injects a static crawlable snapshot
// into #root at build time. Clearing it keeps createRoot (not hydration),
// which the pointer-type branching in the app shell requires.
rootElement.replaceChildren();

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <WallpapersApp />
  </React.StrictMode>
);

startPageAnalytics('wallpapers');
