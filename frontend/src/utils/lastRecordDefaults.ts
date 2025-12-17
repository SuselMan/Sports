import { storage } from './storage';

type LastRecordDefaults = {
  repsAmount?: string;
  durationMs?: string;
  weight?: string;
};

function key(exerciseId: string) {
  return `last_record_defaults:${exerciseId}`;
}

export function getLastRecordDefaults(exerciseId: string): LastRecordDefaults | null {
  if (!exerciseId) return null;
  return storage.get<LastRecordDefaults | null>(key(exerciseId), null);
}

export function setLastRecordDefaults(exerciseId: string, value: LastRecordDefaults): void {
  if (!exerciseId) return;
  storage.set(key(exerciseId), value);
}
