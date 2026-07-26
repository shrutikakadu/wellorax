import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker for installable PWA app
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        console.log('[Wellora PWA] Service Worker registered:', reg.scope);
        // Check for updates periodically
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[Wellora PWA] New version available — reload to update.');
              }
            });
          }
        });
      })
      .catch(err => console.warn('[Wellora PWA] Service Worker registration failed:', err));
  });
}

// Capture the PWA install prompt event so we can trigger it from UI
let deferredInstallPrompt: any = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  window.dispatchEvent(new CustomEvent('wellora-pwa-installable'));
  console.log('[Wellora PWA] App is installable!');
});

// Export for use in components
(window as any).__wellora_pwa_install = async () => {
  if (!deferredInstallPrompt) return false;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  return outcome === 'accepted';
};

window.addEventListener('appinstalled', () => {
  console.log('[Wellora PWA] App installed successfully!');
  deferredInstallPrompt = null;
});
