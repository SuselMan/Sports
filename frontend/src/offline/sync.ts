import type { ISODateString } from '@shared/Shared.model';
import type { Exercise, ExerciseRecordResponse, ExerciseType } from '@shared/Exercise.model';
import type { Metric, MetricRecordResponse, Unit } from '@shared/Metrics.model';
import { apiClient } from '../api/apiClient';
import { getLastServerTimeIso } from '../api/client';
import {
  getLastSync,
  listQueuedSync,
  putExerciseRecords,
  putExercises,
  putMetricRecords,
  putMetrics,
  removeQueuedSync,
  setLastSync,
  type ToSyncItem,
} from './repo';

const SYNC_PAGE_SIZE = 200;

function authed() {
  return localStorage.getItem('auth_token') != null;
}

function nowIso(): ISODateString {
  return new Date().toISOString();
}

function serverNowIso(): ISODateString {
  return (getLastServerTimeIso() ?? nowIso()) as ISODateString;
}

type SyncMode = 'queue' | 'full';
let running: Promise<void> | null = null;
let pendingMode: SyncMode | null = null;

async function run(mode: SyncMode): Promise<void> {
  // Upgrade behavior: if a queue sync is in flight and a full is requested, run full afterwards.
  pendingMode = pendingMode === 'full' ? 'full' : mode;
  if (running) return running;

  running = (async () => {
    while (pendingMode) {
      const m = pendingMode;
      pendingMode = null;
      if (!navigator.onLine) break;
      if (!authed()) break;

      await drainQueueOnce();
      if (m === 'full') {
        const lastSync = await getLastSync();
        await pullAllUpdatedAfter(lastSync as any);
        await setLastSync(serverNowIso());
      }
    }
  })().finally(() => {
    running = null;
  });

  return running;
}

async function drainQueueOnce() {
  const queued = await listQueuedSync();
  for (const item of queued) {
    if (!authed()) throw new Error('unauthorized');
    // eslint-disable-next-line no-await-in-loop
    await syncQueueItem(item);
    // eslint-disable-next-line no-await-in-loop
    await removeQueuedSync(item.key);
  }
}

async function syncQueueItem(item: ToSyncItem) {
  switch (item.entity) {
    case 'exercise': {
      if (item.op === 'archive') {
        try {
          await apiClient.archiveExercise(item._id);
        } catch (e: any) {
          if (e?.response?.status !== 404) throw e;
        }
        return;
      }
      const p = item.payload as { _id: string; name: string; type: ExerciseType; muscles: any[] };
      if (item.op === 'create') {
        try {
          await apiClient.createExercise({ _id: item._id, name: p.name, type: p.type, muscles: p.muscles });
        } catch (e: any) {
          // If already exists (e.g. retried), fall back to update.
          await apiClient.updateExercise(item._id, { name: p.name, type: p.type, muscles: p.muscles });
        }
        return;
      }
      try {
        await apiClient.updateExercise(item._id, { name: p.name, type: p.type, muscles: p.muscles });
      } catch (e: any) {
        if (e?.response?.status === 404) {
          await apiClient.createExercise({ _id: item._id, name: p.name, type: p.type, muscles: p.muscles });
        } else {
          throw e;
        }
      }
      return;
    }
    case 'metric': {
      if (item.op === 'archive') {
        try {
          await apiClient.archiveMetric(item._id);
        } catch (e: any) {
          if (e?.response?.status !== 404) throw e;
        }
        return;
      }
      const p = item.payload as { _id: string; name: string; unit: Unit; muscles?: any[] };
      if (item.op === 'create') {
        try {
          await apiClient.createMetric({ _id: item._id, name: p.name, unit: p.unit, muscles: p.muscles });
        } catch (e: any) {
          await apiClient.updateMetric(item._id, { name: p.name, unit: p.unit, muscles: p.muscles });
        }
        return;
      }
      try {
        await apiClient.updateMetric(item._id, { name: p.name, unit: p.unit, muscles: p.muscles });
      } catch (e: any) {
        if (e?.response?.status === 404) {
          await apiClient.createMetric({ _id: item._id, name: p.name, unit: p.unit, muscles: p.muscles });
        } else {
          throw e;
        }
      }
      return;
    }
    case 'exerciseRecord': {
      if (item.op === 'archive') {
        try {
          await apiClient.archiveExerciseRecord(item._id);
        } catch (e: any) {
          if (e?.response?.status !== 404) throw e;
        }
        return;
      }
      const p = item.payload as {
        _id: string;
        exerciseId: string;
        kind: ExerciseType;
        repsAmount?: number;
        durationMs?: number;
        date: ISODateString;
        note?: string;
        weight?: number;
        rpe?: number;
        restSec?: number;
      };
      if (item.op === 'create') {
        try {
          await apiClient.createExerciseRecord(p.exerciseId, {
            _id: item._id,
            kind: p.kind,
            repsAmount: p.repsAmount,
            durationMs: p.durationMs,
            date: p.date,
            note: p.note,
            weight: p.weight,
            rpe: p.rpe,
            restSec: p.restSec,
          });
        } catch (e: any) {
          await apiClient.updateExerciseRecord(item._id, {
            exerciseId: p.exerciseId,
            kind: p.kind,
            repsAmount: p.repsAmount,
            durationMs: p.durationMs,
            date: p.date,
            note: p.note,
            weight: p.weight,
            rpe: p.rpe,
            restSec: p.restSec,
          });
        }
        return;
      }
      try {
        await apiClient.updateExerciseRecord(item._id, {
          exerciseId: p.exerciseId,
          kind: p.kind,
          repsAmount: p.repsAmount,
          durationMs: p.durationMs,
          date: p.date,
          note: p.note,
          weight: p.weight,
          rpe: p.rpe,
          restSec: p.restSec,
        });
      } catch (e: any) {
        if (e?.response?.status === 404) {
          await apiClient.createExerciseRecord(p.exerciseId, {
            _id: item._id,
            kind: p.kind,
            repsAmount: p.repsAmount,
            durationMs: p.durationMs,
            date: p.date,
            note: p.note,
            weight: p.weight,
            rpe: p.rpe,
            restSec: p.restSec,
          });
        } else {
          throw e;
        }
      }
      return;
    }
    case 'metricRecord': {
      if (item.op === 'archive') {
        try {
          await apiClient.archiveMetricRecord(item._id);
        } catch (e: any) {
          if (e?.response?.status !== 404) throw e;
        }
        return;
      }
      const p = item.payload as {
        _id: string;
        metricId: string;
        value: number;
        date: ISODateString;
        note?: string;
      };
      if (item.op === 'create') {
        try {
          await apiClient.createMetricRecord(p.metricId, {
            _id: item._id,
            value: p.value,
            date: p.date,
            note: p.note,
          });
        } catch (e: any) {
          await apiClient.updateMetricRecord(item._id, {
            metricId: p.metricId,
            value: p.value,
            date: p.date,
            note: p.note,
          });
        }
        return;
      }
      try {
        await apiClient.updateMetricRecord(item._id, {
          metricId: p.metricId,
          value: p.value,
          date: p.date,
          note: p.note,
        });
      } catch (e: any) {
        if (e?.response?.status === 404) {
          await apiClient.createMetricRecord(p.metricId, {
            _id: item._id,
            value: p.value,
            date: p.date,
            note: p.note,
          });
        } else {
          throw e;
        }
      }
    }
  }
}

async function pullAllUpdatedAfter(updatedAfter: ISODateString | '') {
  const updatedAfterParam = updatedAfter || undefined;

  // Exercises
  {
    let page = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const resp = await apiClient.getExercises({
        page,
        pageSize: SYNC_PAGE_SIZE,
        archived: true,
        updatedAfter: updatedAfterParam as any,
        sortBy: 'name',
        sortOrder: 'asc',
      });
      // eslint-disable-next-line no-await-in-loop
      await putExercises(resp.list as Exercise[]);
      if (resp.list.length < SYNC_PAGE_SIZE) break;
      page += 1;
    }
  }

  // Metrics
  {
    let page = 1;
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const resp = await apiClient.getMetrics({
        page,
        pageSize: SYNC_PAGE_SIZE,
        archived: true,
        updatedAfter: updatedAfterParam as any,
        sortBy: 'name',
        sortOrder: 'asc',
      });
      // eslint-disable-next-line no-await-in-loop
      await putMetrics(resp.list as Metric[]);
      if (resp.list.length < SYNC_PAGE_SIZE) break;
      page += 1;
    }
  }

  // Exercise records
  {
    let page = 1;
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const resp = await apiClient.getExerciseRecords({
        page,
        pageSize: SYNC_PAGE_SIZE,
        archived: true,
        updatedAfter: updatedAfterParam as any,
        sortBy: 'date',
        sortOrder: 'asc',
      });
      // eslint-disable-next-line no-await-in-loop
      await putExerciseRecords(resp.list as ExerciseRecordResponse[]);
      if (resp.list.length < SYNC_PAGE_SIZE) break;
      page += 1;
    }
  }

  // Metric records
  {
    let page = 1;
    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const resp = await apiClient.getMetricRecords({
        page,
        pageSize: SYNC_PAGE_SIZE,
        archived: true,
        updatedAfter: updatedAfterParam as any,
        sortBy: 'date',
        sortOrder: 'asc',
      });
      // eslint-disable-next-line no-await-in-loop
      await putMetricRecords(resp.list as MetricRecordResponse[]);
      if (resp.list.length < SYNC_PAGE_SIZE) break;
      page += 1;
    }
  }
}

// Fast path: send only the local queue (used on each local write when online)
export async function syncQueueNow(): Promise<void> {
  await run('queue');
}

// Full sync: send queue then pull changes since lastSync and advance lastSync (used on startup / online)
export async function fullSyncNow(): Promise<void> {
  await run('full');
}

// Backward compat (previous behavior)
export async function syncNow(): Promise<void> {
  await fullSyncNow();
}


