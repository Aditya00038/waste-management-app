"use client";

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service worker registered:', registration);
          })
          .catch(error => {
            console.error('Service worker registration failed:', error);
          });
      });
    }
  }, []);

  return null; // This component doesn't render anything
}
