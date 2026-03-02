
"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type InstallStatus = 'idle' | 'installing' | 'success' | 'failed' | 'unsupported';

interface PWAInstallContextType {
  canInstall: boolean;
  status: InstallStatus;
  error: string | null;
  promptToInstall: () => void;
}

const PWAInstallContext = createContext<PWAInstallContextType | null>(null);

export const usePWAInstall = () => {
  const context = useContext(PWAInstallContext);
  if (!context) {
    throw new Error('usePWAInstall must be used within a PWAInstallProvider');
  }
  return context;
};

export const PWAInstallProvider = ({ children }: { children: React.ReactNode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [status, setStatus] = useState<InstallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const canInstall = !!deferredPrompt;

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setStatus('idle');
      console.log('✅ "beforeinstallprompt" event captured. App is installable.');
    };

    const handleAppInstalled = () => {
      console.log('✅ App has been installed.');
      setDeferredPrompt(null);
      setStatus('success');
    };
    
    console.log('Adding PWA install event listeners.');
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('App is already running in standalone mode.');
        setStatus('success');
    } else {
        console.log('App is running in browser mode.');
    }

    return () => {
      console.log('Removing PWA install event listeners.');
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptToInstall = useCallback(() => {
    if (!deferredPrompt) {
      const reason = 'Install prompt not available. This can happen if the app is already installed, the user previously dismissed the prompt, or the PWA criteria are not met (e.g., not on HTTPS).';
      console.error(reason);
      setError(reason);
      setStatus('unsupported');
      return;
    }
    
    console.log('Triggering install prompt...');
    setStatus('installing');
    setError(null);
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // The 'appinstalled' event will handle the success state.
      } else {
        console.log('User dismissed the install prompt');
        setError('Installation was cancelled by the user.');
        setStatus('idle');
      }
      setDeferredPrompt(null); // The prompt can only be used once.
    }).catch((err: any) => {
      console.error('Error during install prompt:', err);
      setError(err.message || 'An unknown error occurred during installation.');
      setStatus('failed');
    });
  }, [deferredPrompt]);

  const value = {
    canInstall,
    status,
    error,
    promptToInstall,
  };

  return <PWAInstallContext.Provider value={value}>{children}</PWAInstallContext.Provider>;
};
