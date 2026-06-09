import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/app.css';
import './styles/types.css';
import './styles/categories.css';

function adjustWidthVar() {
  const root = document.querySelector(':root');
  const tableWrap = document.querySelector('.modal-table-wrap');
  if (tableWrap) {
    const width = tableWrap.parentElement.clientWidth;
    root.style.setProperty('--tableWidth', width);
  }
}

const observer = new MutationObserver(() => adjustWidthVar());
observer.observe(document.body, { childList: true, subtree: true, attributeFilter: ['class'] });
window.addEventListener('resize', adjustWidthVar);

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
