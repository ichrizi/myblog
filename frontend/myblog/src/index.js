import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';
// If you set `localStorage.setItem('forceVisible','1')` in the browser,
// this will add a class that forces visibility of elements for debugging.
if (typeof document !== 'undefined' && localStorage.getItem('forceVisible') === '1') {
  try {
    document.documentElement.classList.add('debug-visual');
    console.log('DEBUG: forceVisible enabled — debug-visual class added');
  } catch (e) {
    console.warn('DEBUG: could not enable forceVisible', e);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
