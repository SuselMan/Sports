import { useEffect, useRef } from 'react';

/**
 * Subscribe to browser back/forward navigation (popstate) and invoke a callback.
 * Pass enabled=false to disable the subscription.
 */
export function usePopstate(callback: () => void, enabled: boolean = true) {
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    const handler = () => {
      callbackRef.current();
    };
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener('popstate', handler);
    };
  }, [enabled]);
}


