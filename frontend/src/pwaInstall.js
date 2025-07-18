let deferredPrompt = null;

export function initializePWAInstall() {

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
        return;
    }
}

export function installPWA() {
    if (!deferredPrompt) {
        return;
    }

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
        } else {
        }

        deferredPrompt = null;
    });
}

export function setDeferredPrompt(prompt) {
    deferredPrompt = prompt;
}