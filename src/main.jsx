import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/app.css';
import './styles/types.css';
import './styles/categories.css';

let rafId = 0;
function scheduleAdjust() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    rafId = 0;
    const root = document.querySelector(':root');
    const tableWrap = document.querySelector('.modal-table-wrap');
    const entryWrap = document.querySelector('.modal-panel .entry');
    const target = tableWrap || entryWrap;
    if (target) {
      const width = target.parentElement.clientWidth;
      root.style.setProperty('--tableWidth', width);
    }
  });
}

const observer = new MutationObserver(scheduleAdjust);
observer.observe(document.body, { childList: true, subtree: true });
window.addEventListener('resize', scheduleAdjust);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
