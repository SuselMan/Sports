import type {
  Exercise,
  ExerciseListResponse,
  ExerciseRecordsListResponse,
  ExerciseRecordResponse,
  ExerciseType,
} from '@shared/Exercise.model';
import type { Muscles, PaginationRequestData, ISODateString } from '@shared/Shared.model';
import type {
  Metric,
  MetricListResponse,
  MetricRecordListResponse,
  MetricRecordResponse,
  Unit,
} from '@shared/Metrics.model';
import { api } from './client';

type ListParams = Partial<PaginationRequestData>;

function toCsv(arr?: string[]): string | undefined {
  if (!arr?.length) return undefined;
  return arr.join(',');
}

class ApiClient {
  // Auth
  async exchangeGoogleIdToken(idToken: string): Promise<string> {
    const resp = await api.post('/auth/google', { idToken });
    return resp.data?.token as string;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
  }

  // Exercises
  async getExercises(params?: ListParams & { archived?: boolean; updatedAfter?: ISODateString }): Promise<ExerciseListResponse> {
    const resp = await api.get('/exercises', {
      params: { ...params, archived: params?.archived },
    });
    return resp.data as ExerciseListResponse;
  }

  async createExercise(payload: { _id?: string; name: string; type: ExerciseType; muscles: Muscles[] }): Promise<Exercise> {
    const resp = await api.post('/exercises', payload);
    return resp.data as Exercise;
  }

  async updateExercise(exerciseId: string, payload: { name?: string; type?: ExerciseType; muscles?: Muscles[] }): Promise<Exercise> {
    const resp = await api.put(`/exercises/${exerciseId}`, payload);
    return resp.data as Exercise;
  }

  async archiveExercise(exerciseId: string): Promise<{ ok: true }> {
    const resp = await api.delete(`/exercises/${exerciseId}`);
    return resp.data as { ok: true };
  }

  // Exercise Records
  async getExerciseRecords(params: ListParams & {
    dateFrom?: ISODateString;
    dateTo?: ISODateString;
    timeFrom?: string;
    timeTo?: string;
    muscles?: Muscles[];
    exerciseIds?: string[];
    archived?: boolean;
    updatedAfter?: ISODateString;
  }): Promise<ExerciseRecordsListResponse> {
    const resp = await api.get('/exercises/records', {
      params: {
        ...params,
        archived: params.archived,
        muscles: toCsv(params.muscles as unknown as string[]),
        exerciseIds: toCsv(params.exerciseIds),
      },
    });
    return resp.data as ExerciseRecordsListResponse;
  }

  async createExerciseRecord(exerciseId: string, payload: {
    _id?: string;
    kind: ExerciseType;
    repsAmount?: number;
    durationMs?: number;
    date: ISODateString;
    note?: string;
    weight?: number;
    rpe?: number;
    restSec?: number;
  }): Promise<ExerciseRecordResponse> {
    const resp = await api.post(`/exercises/${exerciseId}/records`, payload);
    return resp.data as ExerciseRecordResponse;
  }

  async updateExerciseRecord(recordId: string, payload: {
    exerciseId?: string;
    kind: ExerciseType;
    repsAmount?: number;
    durationMs?: number;
    date: ISODateString;
    note?: string;
    weight?: number;
    rpe?: number;
    restSec?: number;
  }): Promise<ExerciseRecordResponse> {
    const resp = await api.put(`/exercises/records/${recordId}`, payload);
    return resp.data as ExerciseRecordResponse;
  }

  async archiveExerciseRecord(recordId: string): Promise<{ ok: true }> {
    const resp = await api.delete(`/exercises/records/${recordId}`);
    return resp.data as { ok: true };
  }

  // Metrics
  async getMetrics(params?: ListParams & { archived?: boolean; updatedAfter?: ISODateString }): Promise<MetricListResponse> {
    const resp = await api.get('/metrics', {
      params: { ...params, archived: params?.archived },
    });
    return resp.data as MetricListResponse;
  }

  async createMetric(payload: { _id?: string; name: string; unit: Unit; muscles?: Muscles[] }): Promise<Metric> {
    const resp = await api.post('/metrics', payload);
    return resp.data as Metric;
  }

  async updateMetric(metricId: string, payload: { name?: string; unit?: Unit; muscles?: Muscles[] }): Promise<Metric> {
    const resp = await api.put(`/metrics/${metricId}`, payload);
    return resp.data as Metric;
  }

  async archiveMetric(metricId: string): Promise<{ ok: true }> {
    const resp = await api.delete(`/metrics/${metricId}`);
    return resp.data as { ok: true };
  }

  // Metric Records
  async getMetricRecords(params: ListParams & { dateFrom?: ISODateString; dateTo?: ISODateString; archived?: boolean; updatedAfter?: ISODateString }): Promise<MetricRecordListResponse> {
    const resp = await api.get('/metrics/records', {
      params: { ...params, archived: params.archived },
    });
    return resp.data as MetricRecordListResponse;
  }

  async createMetricRecord(metricId: string, payload: { _id?: string; value: number; date: ISODateString; note?: string }): Promise<MetricRecordResponse> {
    const resp = await api.post(`/metrics/${metricId}/records`, payload);
    return resp.data as MetricRecordResponse;
  }

  async updateMetricRecord(recordId: string, payload: { metricId?: string; value?: number; date?: ISODateString; note?: string | null }): Promise<MetricRecordResponse> {
    const resp = await api.put(`/metrics/records/${recordId}`, payload);
    return resp.data as MetricRecordResponse;
  }

  async archiveMetricRecord(recordId: string): Promise<{ ok: true }> {
    const resp = await api.delete(`/metrics/records/${recordId}`);
    return resp.data as { ok: true };
  }
}

export const apiClient = new ApiClient();
