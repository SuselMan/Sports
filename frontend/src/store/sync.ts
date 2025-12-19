import create from 'zustand';
import { getDb } from '../offline/db';
import { fullSyncNow } from '../offline/sync';

type SyncState = {
  bootstrapped: boolean;
  syncing: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  triggerSync: () => Promise<void>;
};

let bootstrapPromise: Promise<void> | null = null;
let bootstrapToken: string | null = null;
let listenersInstalled = false;

export const useSyncStore = create<SyncState>((set, get) => ({
  bootstrapped: false,
  syncing: false,
  error: null,

  bootstrap: async () => {
    const token = localStorage.getItem('auth_token');
    if (bootstrapPromise && bootstrapToken === token) return bootstrapPromise;
    bootstrapToken = token;
    bootstrapPromise = (async () => {
      set({ bootstrapped: false, error: null });
      await getDb(); // ensure IndexedDB is ready so we can render from it

      if (navigator.onLine && token) {
        set({ syncing: true });
        try {
          await fullSyncNow();
        } catch (e: any) {
          // If we got logged out (401), interceptor will clear token; just stop.
          set({ error: e?.message ?? 'Sync failed' });
        } finally {
          set({ syncing: false });
        }
      }

      set({ bootstrapped: true });
    })();
    return bootstrapPromise;
  },

  triggerSync: async () => {
    if (get().syncing) return;
    if (!navigator.onLine) return;
    if (!localStorage.getItem('auth_token')) return;
    set({ syncing: true, error: null });
    try {
      await fullSyncNow();
    } catch (e: any) {
      set({ error: e?.message ?? 'Sync failed' });
    } finally {
      set({ syncing: false });
    }
  },
}));

export function installSyncListeners() {
  if (listenersInstalled) return;
  listenersInstalled = true;

  window.addEventListener('online', () => {
    useSyncStore.getState().triggerSync();
  });
}


