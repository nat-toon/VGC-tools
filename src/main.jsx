import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/app.css';
import './styles/types.css';
import './styles/categories.css';

function adjustWidthVar() {
  document.documentElement.style.setProperty('--windowWidth', window.innerWidth);
}
adjustWidthVar();
window.addEventListener('resize', adjustWidthVar);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
