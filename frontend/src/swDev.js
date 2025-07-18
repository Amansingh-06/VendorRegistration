// swDev.js - Service Worker Registration
export default function swDev() {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
        // Use a relative path that works in both local dev and production
        const swPath = './sw.js';

        // Wait for window load to avoid competing with important resources
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(swPath)
                .then((registration) => {

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const installingWorker = registration.installing;

                        installingWorker.addEventListener('statechange', () => {
                            if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                    // New version installed but waiting to activate

                                    window.location.reload();
                                } else {
                                }
                            }
                        });
                    });

                    // Check for updates every 60 minutes (optional)
                    setInterval(() => {
                        registration.update();
                    }, 60 * 60 * 1000);
                })
                .catch((error) => {
                });
        });
    } else {
    }
  }