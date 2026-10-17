import type { Exercise, ExerciseCreateRequest } from '@shared/Exercise.model';
import { Muscles } from '@shared/Shared.model';
import { getDb, makeSyncKey } from './db';
import { createObjectId } from './objectId';
import { scheduleHealthExport } from './healthExport';
import { OFFLINE_ONLY } from '../config';
import { syncQueueNow } from './sync';

export const EXERCISE_IMPORT_LIMIT = 1024 * 1024;
export type ImportedExercise = Omit<ExerciseCreateRequest, '_id'>;
const nameKey = (name: string) => name.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLocaleLowerCase('ru');

export function parseExerciseImport(text: string): ImportedExercise[] {
  if (new TextEncoder().encode(text).length > EXERCISE_IMPORT_LIMIT) throw Error('Файл больше 1 МБ');
  let data;
  try { data = JSON.parse(text.replace(/^\uFEFF/, '')); } catch { throw Error('Не удалось прочитать JSON'); }
  if (!data || data.schema !== 'kektrack-exercises-v1' || !Array.isArray(data.exercises)) throw Error('Нужен файл упражнений формата kektrack-exercises-v1');
  if (!data.exercises.length || data.exercises.length > 500) throw Error('В файле должно быть от 1 до 500 упражнений');
  const muscles = new Set<string>(Object.values(Muscles));
  return data.exercises.map((row: any, index: number) => {
    const error = () => Error(`Упражнение ${index + 1}: проверь название (1–100 знаков), тип REPS/TIME и коды мышц`);
    if (!row || typeof row.name !== 'string' || !row.name.trim() || row.name.trim().length > 100 || !['REPS', 'TIME'].includes(row.type) || !Array.isArray(row.muscles) || row.muscles.some((m: unknown) => typeof m !== 'string' || !muscles.has(m))) throw error();
    return { name: row.name.trim().replace(/\s+/gu, ' '), type: row.type, muscles: [...new Set<Muscles>(row.muscles)] };
  });
}

export async function importExercises(rows: ImportedExercise[]) {
  // Validate again at the write boundary. One transaction prevents partial imports.
  const validated = parseExerciseImport(JSON.stringify({ schema: 'kektrack-exercises-v1', exercises: rows }));
  const db = await getDb();
  const tx = db.transaction(['exercises', 'toSync'], 'readwrite');
  const existing = await tx.objectStore('exercises').getAll();
  // Archived exercises also count as existing: never restore or change them silently.
  const names = new Set(existing.map((row) => nameKey(row.name)));
  let added = 0;
  for (const row of validated) {
    const key = nameKey(row.name);
    if (names.has(key)) continue;
    const now = new Date().toISOString();
    const entity: Exercise = { ...row, _id: createObjectId(), archived: false, createdAt: now, updatedAt: now };
    await tx.objectStore('exercises').add(entity);
    await tx.objectStore('toSync').put({ key: makeSyncKey('exercise', entity._id), entity: 'exercise', op: 'create', _id: entity._id, payload: { _id: entity._id, ...row }, createdAt: now, updatedAt: now });
    names.add(key);
    added += 1;
  }
  await tx.done;
  if (added) {
    window.dispatchEvent(new Event('sports-db-change'));
    scheduleHealthExport();
    if (!OFFLINE_ONLY && navigator.onLine) void syncQueueNow().catch(() => {});
  }
  return { added, skipped: validated.length - added };
}
