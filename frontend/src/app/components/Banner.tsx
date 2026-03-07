import React, { useEffect, useRef } from 'react';
import { useApp } from '@/app/context/AppContext';
import { CheckCircle, X, XCircle } from 'lucide-react';

export function Banner() {
  const { banner, clearBanner } = useApp();
  const timeoutRef = useRef<number | null>(null);

  // Auto dismiss after a few seconds so the UI does not get stuck with old errors.
  useEffect(() => {
    if (!banner) return;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = window.setTimeout(() => {
      clearBanner();
      timeoutRef.current = null;
    }, 4500);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [banner, clearBanner]);

  if (!banner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 p-4 ${
        banner.type === 'success' ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800'
      } border-b`}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        {banner.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        <p className="font-medium flex-1">{banner.message}</p>

        <button
          type="button"
          onClick={clearBanner}
          aria-label="Close notification"
          className="ml-auto inline-flex items-center justify-center rounded-md p-1 opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
