import type { Exercise, ExerciseType, ExerciseRecordResponse } from '@shared/Exercise.model';
import type { ISODateString, Muscles } from '@shared/Shared.model';
import type { Metric, MetricRecordResponse, Unit } from '@shared/Metrics.model';
import { createObjectId } from './objectId';
import {
  getExerciseRecordsLocal,
  getExercisesLocal,
  getMetricRecordsLocal,
  getMetricsLocal,
  putExerciseRecords,
  putExercises,
  putMetricRecords,
  putMetrics,
  queueSync,
} from './repo';
import { syncQueueNow } from './sync';

function nowIso(): ISODateString {
  return new Date().toISOString();
}

async function maybeSync() {
  if (navigator.onLine) await syncQueueNow();
}

export async function upsertExerciseLocal(input: {
  _id?: string;
  name: string;
  type: ExerciseType;
  muscles: Muscles[];
}) {
  const _id = input._id ?? createObjectId();
  const t = nowIso();
  const existing = (await getExercisesLocal()).find((e) => e._id === _id);
  const entity: Exercise = {
    ...(existing ?? {}),
    _id,
    name: input.name,
    type: input.type,
    muscles: input.muscles,
    archived: existing?.archived ?? false,
    createdAt: existing?.createdAt ?? t,
    updatedAt: t,
  };
  await putExercises([entity]);
  await queueSync('exercise', entity.archived ? 'archive' : (existing ? 'update' : 'create'), _id, {
    _id,
    name: entity.name,
    type: entity.type,
    muscles: entity.muscles,
  });
  await maybeSync();
  return entity;
}

export async function archiveExerciseLocal(exerciseId: string) {
  const list = await getExercisesLocal();
  const ex = list.find((e) => e._id === exerciseId);
  if (!ex) return;
  const t = nowIso();
  await putExercises([{ ...ex, archived: true, updatedAt: t }]);
  await queueSync('exercise', 'archive', exerciseId, {});
  await maybeSync();
}

export async function upsertMetricLocal(input: {
  _id?: string;
  name: string;
  unit: Unit;
  muscles?: Muscles[];
}) {
  const _id = input._id ?? createObjectId();
  const t = nowIso();
  const existing = (await getMetricsLocal()).find((m) => m._id === _id);
  const entity: Metric = {
    ...(existing ?? {}),
    _id,
    name: input.name,
    unit: input.unit,
    muscles: input.muscles ?? [],
    archived: existing?.archived ?? false,
    createdAt: existing?.createdAt ?? t,
    updatedAt: t,
  };
  await putMetrics([entity]);
  await queueSync('metric', entity.archived ? 'archive' : (existing ? 'update' : 'create'), _id, {
    _id,
    name: entity.name,
    unit: entity.unit,
    muscles: entity.muscles,
  });
  await maybeSync();
  return entity;
}

export async function archiveMetricLocal(metricId: string) {
  const list = await getMetricsLocal();
  const m = list.find((x) => x._id === metricId);
  if (!m) return;
  const t = nowIso();
  await putMetrics([{ ...m, archived: true, updatedAt: t }]);
  await queueSync('metric', 'archive', metricId, {});
  await maybeSync();
}

export async function upsertExerciseRecordLocal(input: {
  _id?: string;
  exerciseId: string;
  kind: ExerciseType;
  repsAmount?: number;
  durationMs?: number;
  date: ISODateString;
  note?: string;
  weight?: number;
  rpe?: number;
  restSec?: number;
}) {
  const _id = input._id ?? createObjectId();
  const t = nowIso();
  const existing = (await getExerciseRecordsLocal()).find((r) => r._id === _id);
  const entity: ExerciseRecordResponse = {
    ...(existing ?? ({} as any)),
    _id,
    exerciseId: input.exerciseId,
    kind: input.kind,
    repsAmount: input.repsAmount,
    durationMs: input.durationMs,
    date: input.date,
    note: input.note,
    weight: input.weight,
    rpe: input.rpe,
    restSec: input.restSec,
    archived: existing?.archived ?? false,
    createdAt: existing?.createdAt ?? t,
    updatedAt: t,
    // `exercise` will be overwritten on next pull; keep whatever we had.
    exercise: (existing as any)?.exercise,
  };
  await putExerciseRecords([entity]);
  await queueSync('exerciseRecord', entity.archived ? 'archive' : (existing ? 'update' : 'create'), _id, {
    _id,
    exerciseId: entity.exerciseId,
    kind: entity.kind,
    repsAmount: entity.repsAmount,
    durationMs: entity.durationMs,
    date: entity.date,
    note: entity.note,
    weight: entity.weight,
    rpe: entity.rpe,
    restSec: entity.restSec,
  });
  await maybeSync();
  return entity;
}

export async function archiveExerciseRecordLocal(recordId: string) {
  const list = await getExerciseRecordsLocal();
  const r = list.find((x) => x._id === recordId);
  if (!r) return;
  const t = nowIso();
  await putExerciseRecords([{ ...r, archived: true, updatedAt: t }]);
  await queueSync('exerciseRecord', 'archive', recordId, {});
  await maybeSync();
}

export async function upsertMetricRecordLocal(input: {
  _id?: string;
  metricId: string;
  value: number;
  date: ISODateString;
  note?: string;
}) {
  const _id = input._id ?? createObjectId();
  const t = nowIso();
  const existing = (await getMetricRecordsLocal()).find((r) => r._id === _id);
  const entity: MetricRecordResponse = {
    ...(existing ?? ({} as any)),
    _id,
    metricId: input.metricId,
    value: input.value,
    date: input.date,
    note: input.note,
    archived: existing?.archived ?? false,
    createdAt: existing?.createdAt ?? t,
    updatedAt: t,
    metric: (existing as any)?.metric,
  };
  await putMetricRecords([entity]);
  await queueSync('metricRecord', entity.archived ? 'archive' : (existing ? 'update' : 'create'), _id, {
    _id,
    metricId: entity.metricId,
    value: entity.value,
    date: entity.date,
    note: entity.note,
  });
  await maybeSync();
  return entity;
}

export async function archiveMetricRecordLocal(recordId: string) {
  const list = await getMetricRecordsLocal();
  const r = list.find((x) => x._id === recordId);
  if (!r) return;
  const t = nowIso();
  await putMetricRecords([{ ...r, archived: true, updatedAt: t }]);
  await queueSync('metricRecord', 'archive', recordId, {});
  await maybeSync();
}


