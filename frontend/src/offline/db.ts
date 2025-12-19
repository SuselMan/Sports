import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Exercise, ExerciseRecordResponse } from '@shared/Exercise.model';
import type { Metric, MetricRecordResponse } from '@shared/Metrics.model';

export type SyncEntityType = 'exercise' | 'exerciseRecord' | 'metric' | 'metricRecord';
export type SyncOp = 'create' | 'update' | 'upsert' | 'archive';

// Keyed by `${entity}:${_id}` so we can coalesce (last write wins) by overwriting.
export type ToSyncItem = {
  key: string;
  entity: SyncEntityType;
  op: SyncOp;
  _id: string;
  payload: any;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

type MetaRow = {
  key: 'lastSync';
  value: string; // ISO
};

interface SportsDbSchema extends DBSchema {
  meta: {
    key: MetaRow['key'];
    value: MetaRow;
  };
  exercises: {
    key: string; // _id
    value: Exercise;
    indexes: { 'by-updatedAt': string };
  };
  exerciseRecords: {
    key: string; // _id
    value: ExerciseRecordResponse;
    indexes: { 'by-updatedAt': string; 'by-date': string };
  };
  metrics: {
    key: string; // _id
    value: Metric;
    indexes: { 'by-updatedAt': string };
  };
  metricRecords: {
    key: string; // _id
    value: MetricRecordResponse;
    indexes: { 'by-updatedAt': string; 'by-date': string };
  };
  toSync: {
    key: string; // `${entity}:${_id}`
    value: ToSyncItem;
    indexes: { 'by-updatedAt': string };
  };
}

let dbPromise: Promise<IDBPDatabase<SportsDbSchema>> | null = null;

export function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<SportsDbSchema>('sports-db', 1, {
      upgrade(db) {
        const meta = db.createObjectStore('meta', { keyPath: 'key' });
        meta.put({ key: 'lastSync', value: '' });

        const exercises = db.createObjectStore('exercises', { keyPath: '_id' });
        exercises.createIndex('by-updatedAt', 'updatedAt');

        const exerciseRecords = db.createObjectStore('exerciseRecords', { keyPath: '_id' });
        exerciseRecords.createIndex('by-updatedAt', 'updatedAt');
        exerciseRecords.createIndex('by-date', 'date');

        const metrics = db.createObjectStore('metrics', { keyPath: '_id' });
        metrics.createIndex('by-updatedAt', 'updatedAt');

        const metricRecords = db.createObjectStore('metricRecords', { keyPath: '_id' });
        metricRecords.createIndex('by-updatedAt', 'updatedAt');
        metricRecords.createIndex('by-date', 'date');

        const toSync = db.createObjectStore('toSync', { keyPath: 'key' });
        toSync.createIndex('by-updatedAt', 'updatedAt');
      },
    });
  }
  return dbPromise;
}

export function makeSyncKey(entity: SyncEntityType, id: string) {
  return `${entity}:${id}`;
}


