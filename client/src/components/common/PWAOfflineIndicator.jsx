import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';

const PWAOfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {/* 1. Offline Notification */}
      {isOffline && (
        <motion.div
          key="offline-banner"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-amber-600/90 text-white backdrop-blur-md shadow-lg border-b border-amber-500/40 py-2 px-4"
        >
          <div className="container mx-auto max-w-7xl flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-medium">
              <span className="p-1 rounded-full bg-black/20">
                <WifiOff className="w-3.5 h-3.5 text-amber-200" />
              </span>
              <span>
                <strong>Offline Mode:</strong> You are currently disconnected. Cached masterclasses remain available.
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-[11px] font-semibold transition-colors shrink-0 ml-2"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. Connection Restored Toast */}
      {showRestored && (
        <motion.div
          key="restored-banner"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3 }}
          className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-emerald-600/90 via-teal-600/90 to-emerald-600/90 text-white backdrop-blur-md shadow-lg border-b border-emerald-500/40 py-2 px-4"
        >
          <div className="container mx-auto max-w-7xl flex items-center justify-center gap-2 text-xs sm:text-sm font-medium">
            <span className="p-1 rounded-full bg-black/20">
              <Wifi className="w-3.5 h-3.5 text-emerald-200" />
            </span>
            <span>Back online! Connection restored.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAOfflineIndicator;
