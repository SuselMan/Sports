import type { Exercise, ExerciseRecordResponse } from '@shared/Exercise.model';
import type { Metric, MetricRecordResponse } from '@shared/Metrics.model';
import { getDb, makeSyncKey, type SyncEntityType, type SyncOp, type ToSyncItem } from './db';

export type { ToSyncItem } from './db';

function nowIso() {
  return new Date().toISOString();
}

function emitDbChange() {
  window.dispatchEvent(new CustomEvent('sports-db-change'));
}

async function upsertMany<T extends { _id: string }>(
  storeName: 'exercises' | 'exerciseRecords' | 'metrics' | 'metricRecords',
  items: T[],
) {
  const db = await getDb();
  const tx = db.transaction(storeName, 'readwrite');
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    await tx.store.put(item as any);
  }
  await tx.done;
  emitDbChange();
}

async function getAll<T>(
  storeName: 'exercises' | 'exerciseRecords' | 'metrics' | 'metricRecords',
) {
  const db = await getDb();
  return db.getAll(storeName) as Promise<T[]>;
}

export async function getLastSync(): Promise<string> {
  const db = await getDb();
  const row = await db.get('meta', 'lastSync');
  return row?.value ?? '';
}

export async function setLastSync(value: string): Promise<void> {
  const db = await getDb();
  await db.put('meta', { key: 'lastSync', value });
  emitDbChange();
}

export async function queueSync(entity: SyncEntityType, op: SyncOp, _id: string, payload: any): Promise<void> {
  const db = await getDb();
  const t = nowIso();
  const key = makeSyncKey(entity, _id);

  const existing = await db.get('toSync', key);
  // Coalesce rules:
  // - archive wins over everything
  // - create + update => keep create (but update payload)
  // - create + archive => cancel sync item (never existed on server)
  if (existing?.op === 'create' && op === 'update') op = 'create';
  if (existing?.op === 'create' && op === 'archive') {
    await db.delete('toSync', key);
    emitDbChange();
    return;
  }
  if (existing?.op === 'archive' && op !== 'archive') op = 'archive';

  const item: ToSyncItem = {
    key,
    entity,
    op,
    _id,
    payload,
    createdAt: t,
    updatedAt: t,
  };
  await db.put('toSync', item);
  emitDbChange();
}

export async function listQueuedSync(): Promise<ToSyncItem[]> {
  const db = await getDb();
  // Deterministic order: by updatedAt asc
  const idx = db.transaction('toSync').store.index('by-updatedAt');
  return idx.getAll() as Promise<ToSyncItem[]>;
}

export async function removeQueuedSync(key: string): Promise<void> {
  const db = await getDb();
  await db.delete('toSync', key);
  emitDbChange();
}

export async function putExercises(list: Exercise[]) {
  await upsertMany('exercises', list);
}

export async function putMetrics(list: Metric[]) {
  await upsertMany('metrics', list);
}

export async function putExerciseRecords(list: ExerciseRecordResponse[]) {
  await upsertMany('exerciseRecords', list);
}

export async function putMetricRecords(list: MetricRecordResponse[]) {
  await upsertMany('metricRecords', list);
}

export async function getExercisesLocal(): Promise<Exercise[]> {
  return getAll<Exercise>('exercises');
}

export async function getMetricsLocal(): Promise<Metric[]> {
  return getAll<Metric>('metrics');
}

export async function getExerciseRecordsLocal(): Promise<ExerciseRecordResponse[]> {
  return getAll<ExerciseRecordResponse>('exerciseRecords');
}

export async function getMetricRecordsLocal(): Promise<MetricRecordResponse[]> {
  return getAll<MetricRecordResponse>('metricRecords');
}


