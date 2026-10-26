/**
 * whitedavid23 - PWA Service Worker Registration & Lifecycle Handler
 */

let registrationInstance = null;

export const registerServiceWorker = ({ onUpdate, onSuccess } = {}) => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      registrationInstance = registration;

      console.log('[PWA] Service Worker registered with scope:', registration.scope);

      // Check if there is already an active service worker and ready
      if (registration.active && onSuccess) {
        onSuccess(registration);
      }

      // Check for updates periodically (e.g. every 60 minutes)
      setInterval(() => {
        registration.update().catch((err) => {
          console.debug('[PWA] Periodic update check skipped:', err.message);
        });
      }, 60 * 60 * 1000);

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available and waiting
              console.log('[PWA] New content is available; please refresh.');
              if (onUpdate) {
                onUpdate(registration);
              }
            } else {
              // Content is cached for offline use
              console.log('[PWA] Content is cached for offline use.');
              if (onSuccess) {
                onSuccess(registration);
              }
            }
          }
        });
      });
    } catch (error) {
      console.warn('[PWA] Service Worker registration failed:', error);
    }
  });

  // Ensure refresh on controller change when user updates
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
};

export const skipWaitingAndReload = () => {
  if (registrationInstance && registrationInstance.waiting) {
    registrationInstance.waiting.postMessage({ type: 'SKIP_WAITING' });
  } else {
    window.location.reload();
  }
};

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.unregister();
  }
};
