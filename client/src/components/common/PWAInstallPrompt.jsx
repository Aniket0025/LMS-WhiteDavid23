import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles, Smartphone, Check, Zap } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already installed / standalone mode
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Check if dismissed recently (within 7 days)
    const dismissedTime = localStorage.getItem('whitedavid23_pwa_dismissed');
    if (dismissedTime) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // 3. Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.__pwaDeferredPrompt = e;
      window.dispatchEvent(new CustomEvent('pwa-can-install-changed', { detail: { canInstall: true } }));

      // Wait a few seconds after initial load to not bombard the user immediately
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3500);

      return () => clearTimeout(timer);
    };

    // 4. Capture appinstalled event
    const handleAppInstalled = () => {
      setIsVisible(false);
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__pwaDeferredPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa-can-install-changed', { detail: { canInstall: false } }));
      localStorage.removeItem('whitedavid23_pwa_dismissed');
      console.log('[PWA] whitedavid23 app was installed successfully.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptToUse = deferredPrompt || window.__pwaDeferredPrompt;
    if (!promptToUse) return;

    try {
      await promptToUse.prompt();
      const { outcome } = await promptToUse.userChoice;
      console.log('[PWA] User choice outcome:', outcome);

      if (outcome === 'accepted') {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
      window.__pwaDeferredPrompt = null;
      window.dispatchEvent(new CustomEvent('pwa-can-install-changed', { detail: { canInstall: false } }));
    } catch (err) {
      console.error('[PWA] Error triggering install prompt:', err);
    }
  };

  useEffect(() => {
    window.promptPWAInstall = handleInstallClick;
    return () => {
      delete window.promptPWAInstall;
    };
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('whitedavid23_pwa_dismissed', Date.now().toString());
  };

  if (!isVisible || isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-sm w-full"
      >
        <div className="relative rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-4 sm:p-5 shadow-2xl shadow-blue-500/10 overflow-hidden">
          {/* Ambient background glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            aria-label="Close Install Prompt"
            className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 relative z-10">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-0.5 shadow-md shrink-0 flex items-center justify-center overflow-hidden">
              <img 
                src="/favicon-192x192.png" 
                alt="whitedavid23" 
                className="w-full h-full object-contain p-1.5"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Install whitedavid<span className="text-blue-400">23</span>
                </h4>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  App
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                Add to your home screen for offline access & faster video playback.
              </p>

              {/* Perks list */}
              <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Fast
                </span>
                <span className="inline-flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> Offline
                </span>
                <span className="inline-flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-blue-400" /> Standalone
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-4 relative z-10">
            <button
              onClick={handleInstallClick}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs border border-slate-700 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
