import { useEffect, useRef } from 'react';
import { isMobile } from 'react-device-detect';
import { usePopstate } from './usePopstate';

/**
 * Handle closing a modal/dialog on mobile when the user presses the browser back button.
 * - When the modal opens, we push a dummy history state, so a back press generates popstate.
 * - On popstate, if the modal is open, call onClose and mark the pushed state as popped.
 * - When the modal closes programmatically, we remove the dummy state with history.back().
 */
export function useModalBackClose(open: boolean, onClose: () => void, enabled: boolean = true) {
  const pushedRef = useRef(false);
  const poppedRef = useRef(false);
  const active = enabled && isMobile;

  useEffect(() => {
    if (!active) return;
    if (open && !pushedRef.current) {
      history.pushState({ modal: true }, '');
      pushedRef.current = true;
      poppedRef.current = false;
    }
    if (!open && pushedRef.current) {
      if (!poppedRef.current) {
        // Closed programmatically; remove our dummy entry
        history.back();
      }
      pushedRef.current = false;
      poppedRef.current = false;
    }

    return () => {
      // Cleanup on unmount: if our state is still pushed and not popped, pop it
      if (pushedRef.current && !poppedRef.current) {
        history.back();
        pushedRef.current = false;
        poppedRef.current = false;
      }
    };
  }, [open, active]);

  usePopstate(() => {
    if (!active) return;
    if (open && pushedRef.current) {
      poppedRef.current = true;
      onClose();
    }
  }, active);
}


