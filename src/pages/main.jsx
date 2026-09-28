import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SpeakProvider } from './context/SpeakContext';
import { SocketProvider } from './context/SocketContext';
import './styles.css';

// A static host answers an unknown path with 404.html, which bounces back to
// "/" (see public/404.html). Restore the original route before the router
// mounts, otherwise every deep link or refresh lands on the landing page.
try {
  const redirect = sessionStorage.getItem('kabadi-redirect');
  if (redirect && redirect !== '/') {
    sessionStorage.removeItem('kabadi-redirect');
    history.replaceState(null, '', redirect);
  }
} catch (e) {
  /* private mode — routing still works, just without the restore */
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <SpeakProvider>
            <SocketProvider>
              <App />
            </SocketProvider>
          </SpeakProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);