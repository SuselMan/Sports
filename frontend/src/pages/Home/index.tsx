import React, { useEffect, useMemo, useState } from 'react';
import Button from '@uikit/components/Button/Button';
import Modal from '@uikit/components/Modal/Modal';
import { Muscles } from '@shared/Shared.model';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from '@uikit/components/Spinner/Spinner';
import EmptyView from '@uikit/components/EmptyView/EmptyView';
import {
  Exercise,
  ExerciseRecordResponse,
  ExerciseRecordsListResponse,
  ExerciseListResponse,
} from '@shared/Exercise.model';
import type {
  Metric,
  MetricRecordListResponse,
  MetricRecordResponse,
} from '@shared/Metrics.model';
import { AxiosResponse } from 'axios';
import { setLastRecordDefaults } from '../../utils/lastRecordDefaults';
import { DateRange } from '../../components/DateRange';
import { api } from '../../api/client';
import { useDateRangeStore } from '../../store/filters';
import { ExerciseRecordCard } from '../../components/ExerciseRecordCard';
import { ExerciseGroupCard } from '../../components/ExerciseGroupCard';
import { ExerciseRecordForm, ExerciseRecordFormValue } from '../../components/ExerciseRecordForm';
import { MetricRecordForm, MetricRecordFormValue } from '../../components/MetricRecordForm';
import { MetricRecordCard } from '../../components/MetricRecordCard';
import { MusclesMap } from '../../components/MusclesMap';
import { AddFab } from '../../components/AddFab';
import { useModalBackClose } from '../../hooks/useModalBackClose';
import styles from './styles.module.css';

const Home: React.FC = () => {
  const range = useDateRangeStore((s) => s.range);
  const setRange = useDateRangeStore((s) => s.setRange);
  const { t } = useTranslation();
  const [records, setRecords] = useState<ExerciseRecordResponse[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricRecords, setMetricRecords] = useState<MetricRecordResponse[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [isLoadingMetricRecords, setIsLoadingMetricRecords] = useState(true);
  type CurrentModal =
    | 'RecordType'
    | 'ExerciseCreate'
    | 'ExerciseEdit'
    | 'MetricCreate'
    | 'MetricEdit'
    | null;
  const [currentModal, setCurrentModal] = useState<CurrentModal>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ExerciseRecordFormValue>({
    exerciseId: '',
    kind: 'REPS',
    date: range.from,
  });
  const [metricEditId, setMetricEditId] = useState<string | null>(null);
  const [metricForm, setMetricForm] = useState<MetricRecordFormValue>({
    metricId: '',
    date: range.from,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingExercises(true);
      try {
        const ex: AxiosResponse<ExerciseListResponse> = await api.get('/exercises', {
          params: {
            page: 1, pageSize: 100, sortBy: 'name', sortOrder: 'asc',
          },
        });
        if (!cancelled) {
          setExercises(ex.data.list);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingExercises(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingMetrics(true);
      try {
        const resp = await api.get('/metrics', {
          params: {
            page: 1, pageSize: 200, sortBy: 'name', sortOrder: 'asc',
          },
        });
        if (!cancelled) {
          setMetrics(resp.data.list);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMetrics(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingRecords(true);
      try {
        const resp: AxiosResponse<ExerciseRecordsListResponse> = await api.get('/exercises/records', {
          params: {
            page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to,
          },
        });
        if (!cancelled) {
          setRecords(resp.data.list);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingRecords(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingMetricRecords(true);
      try {
        const resp: AxiosResponse<MetricRecordListResponse> = await api.get('/metrics/records', {
          params: {
            page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to,
          },
        });
        if (!cancelled) {
          setMetricRecords(resp.data.list);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMetricRecords(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range]);

  const highlightedMuscles = useMemo(
    () => Array.from(
      new Set(
        records.flatMap((r) => (r.exercise?.muscles ? r.exercise.muscles : [])),
      ),
    ) as Muscles[],
    [records],
  );

  const groups = useMemo<{ exercise: Exercise; records: ExerciseRecordResponse[] }[]>(() => {
    const order: string[] = [];
    const map = new Map<string, { exercise: Exercise; records: ExerciseRecordResponse[] }>();
    records.forEach((r) => {
      const key = r.exerciseId;
      if (!map.has(key)) {
        order.push(key);
        map.set(key, { exercise: r.exercise, records: [r] });
      } else {
        map.get(key)!.records.push(r);
      }
    });
    return order.map((k) => map.get(k)!).filter(Boolean);
  }, [records]);

  const submit = async () => {
    if (!form.exerciseId) return;
    await api.post(`/exercises/${form.exerciseId}/records`, {
      kind: form.kind,
      repsAmount: form.kind === 'REPS' ? Number(form.repsAmount) : undefined,
      durationMs: form.kind === 'TIME' ? Number(form.durationMs) : undefined,
      date: form.date,
      weight: form.weight ? Number(form.weight) : undefined,
      note: form.note || undefined,
    });
    setLastRecordDefaults(form.exerciseId, {
      repsAmount: form.repsAmount || undefined,
      durationMs: form.durationMs || undefined,
      weight: form.weight || undefined,
    });
    setCurrentModal(null);
    setForm({ exerciseId: '', kind: 'REPS', date: range.from });
    const resp = await api.get('/exercises/records', {
      params: {
        page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to,
      },
    });
    setRecords(resp.data.list);
  };

  const submitMetric = async () => {
    if (!metricForm.metricId || !metricForm.value) return;
    await api.post(`/metrics/${metricForm.metricId}/records`, {
      value: Number(metricForm.value),
      date: metricForm.date,
      note: metricForm.note || undefined,
    });
    setCurrentModal(null);
    setMetricForm({ metricId: '', date: range.from });
    const resp: AxiosResponse<MetricRecordListResponse> = await api.get('/metrics/records', {
      params: {
        page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to,
      },
    });
    setMetricRecords(resp.data.list);
  };

  // Close dialogs on mobile back button
  useModalBackClose(currentModal != null, () => setCurrentModal(null));

  const isLoading = isLoadingExercises || isLoadingRecords || isLoadingMetrics || isLoadingMetricRecords;
  const openAddRecord = () => {
    setForm({ exerciseId: '', kind: 'REPS', date: range.from });
    setCurrentModal('ExerciseCreate');
  };

  const openAddMetricRecord = () => {
    setMetricForm({ metricId: '', date: range.from });
    setCurrentModal('MetricCreate');
  };

  return (
    <div className={styles.root}>
      <DateRange value={range} onChange={setRange} />

      {!!records.length && (
        <div className={styles.musclesBox}>
          <MusclesMap muscles={highlightedMuscles} onMuscleClicked={() => {}} />
        </div>
      )}

      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.loading}>
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {groups.map((g) => (g.records.length === 1 ? (
              <ExerciseRecordCard
                key={g.records[0]._id}
                record={g.records[0]}
                showReps={false}
                showMuscles={false}
                onDeleted={(id) => setRecords((prev) => prev.filter((x) => x._id !== id))}
                onRepeated={(created) => setRecords((prev) => [created, ...prev])}
                onOpen={(r) => {
                  setEditId(r._id);
                  setForm({
                    exerciseId: r.exerciseId,
                    kind: r.kind,
                    repsAmount: r.kind === 'REPS' ? String(r.repsAmount ?? '') : undefined,
                    durationMs: r.kind === 'TIME' ? String(r.durationMs ?? '') : undefined,
                    weight: r.weight != null ? String(r.weight) : undefined,
                    note: r.note,
                    date: r.date,
                  });
                  setCurrentModal('ExerciseEdit');
                }}
              />
            ) : (
              <ExerciseGroupCard
                key={g.exercise?._id || g.records[0]._id}
                exercise={g.exercise}
                records={g.records}
                onDeleted={(id) => setRecords((prev) => prev.filter((x) => x._id !== id))}
                onRepeated={(created) => setRecords((prev) => [created, ...prev])}
                onOpen={(r) => {
                  setEditId(r._id);
                  setForm({
                    exerciseId: r.exerciseId,
                    kind: r.kind,
                    repsAmount: r.kind === 'REPS' ? String(r.repsAmount ?? '') : undefined,
                    durationMs: r.kind === 'TIME' ? String(r.durationMs ?? '') : undefined,
                    weight: r.weight != null ? String(r.weight) : undefined,
                    note: r.note,
                    date: r.date,
                  });
                  setCurrentModal('ExerciseEdit');
                }}
              />
            )))}

            {metricRecords.map((mr) => (
              <MetricRecordCard
                key={mr._id}
                record={mr}
                onDeleted={(id) => setMetricRecords((prev) => prev.filter((x) => x._id !== id))}
                onOpen={(r) => {
                  setMetricEditId(r._id);
                  setMetricForm({
                    metricId: r.metricId,
                    value: String(r.value),
                    note: r.note,
                    date: r.date,
                  });
                  setCurrentModal('MetricEdit');
                }}
              />
            ))}

            {!records.length && !metricRecords.length && (
              exercises.length === 0 && metrics.length === 0 ? (
                <EmptyView title={t('home.noExercisesPrefix')}>
                  <div>
                    <RouterLink to="/exercises?createNew=true">{t('home.createFirstOne')}</RouterLink>
                    {' '}
                    {t('home.noExercisesSuffix')}
                  </div>
                </EmptyView>
              ) : (
                <EmptyView title={t('home.noRecordsForPeriod')}>
                  <div>{t('home.noRecordsForPeriodHint')}</div>
                  <div className={styles.emptyActions}>
                    <Button type="active" size="md" onClick={() => setCurrentModal('RecordType')}>{t('home.addRecordCta')}</Button>
                  </div>
                </EmptyView>
              )
            )}
          </>
        )}
      </div>

      <AddFab onClick={() => setCurrentModal('RecordType')} disabled={isLoading} />

      {currentModal && (
        <Modal
          title={
            currentModal === 'RecordType' ? t('home.logWhat')
              : currentModal === 'ExerciseCreate' ? t('records.addTitle')
                : currentModal === 'ExerciseEdit' ? t('records.editTitle')
                  : currentModal === 'MetricCreate' ? t('metricRecords.addTitle')
                    : t('metricRecords.editTitle')
          }
          close={() => setCurrentModal(null)}
        >
          <div className={styles.modalCol}>
            {currentModal === 'RecordType' && (
              <>
                <Button
                  type="active"
                  size="md"
                  onClick={() => {
                    setForm({ exerciseId: '', kind: 'REPS', date: range.from });
                    setCurrentModal('ExerciseCreate');
                  }}
                  disabled={!exercises.length}
                >
                  {t('home.logExercise')}
                </Button>
                <Button
                  type="active"
                  size="md"
                  onClick={() => {
                    setMetricForm({ metricId: '', date: range.from });
                    setCurrentModal('MetricCreate');
                  }}
                  disabled={!metrics.length}
                >
                  {t('home.logMetric')}
                </Button>
                {(!exercises.length || !metrics.length) && (
                  <div className={styles.emptyText}>
                    {!exercises.length ? (
                      <div>
                        <RouterLink to="/exercises?createNew=true">{t('home.createFirstOne')}</RouterLink>
                      </div>
                    ) : null}
                    {!metrics.length ? (
                      <div>
                        <RouterLink to="/metrics">{t('nav.metrics')}</RouterLink>
                      </div>
                    ) : null}
                  </div>
                )}
              </>
            )}

            {(currentModal === 'ExerciseCreate' || currentModal === 'ExerciseEdit') && (
              <>
                <ExerciseRecordForm exercises={exercises} form={form} onChange={setForm} />
                <div className={styles.modalActions}>
                  <Button onClick={() => setCurrentModal(null)}>{t('actions.cancel')}</Button>
                  <Button
                    onClick={async () => {
                      if (currentModal === 'ExerciseCreate') {
                        await submit();
                        return;
                      }
                      if (!editId) return;
                      await api.put(`/exercises/records/${editId}`, {
                        exerciseId: form.exerciseId,
                        kind: form.kind,
                        repsAmount: form.kind === 'REPS' ? Number(form.repsAmount) : undefined,
                        durationMs: form.kind === 'TIME' ? Number(form.durationMs) : undefined,
                        date: form.date,
                        weight: form.weight ? Number(form.weight) : undefined,
                        note: form.note || undefined,
                      });
                      setCurrentModal(null);
                      const resp = await api.get('/exercises/records', {
                        params: {
                          page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to,
                        },
                      });
                      setRecords(resp.data.list);
                    }}
                  >
                    {t('actions.save')}
                  </Button>
                </div>
              </>
            )}

            {(currentModal === 'MetricCreate' || currentModal === 'MetricEdit') && (
              <>
                <MetricRecordForm metrics={metrics} form={metricForm} onChange={setMetricForm} />
                <div className={styles.modalActions}>
                  <Button onClick={() => setCurrentModal(null)}>{t('actions.cancel')}</Button>
                  <Button
                    onClick={async () => {
                      if (currentModal === 'MetricCreate') {
                        await submitMetric();
                        return;
                      }
                      if (!metricEditId) return;
                      await api.put(`/metrics/records/${metricEditId}`, {
                        metricId: metricForm.metricId,
                        value: metricForm.value != null ? Number(metricForm.value) : undefined,
                        date: metricForm.date,
                        note: metricForm.note || undefined,
                      });
                      setCurrentModal(null);
                      const resp: AxiosResponse<MetricRecordListResponse> = await api.get('/metrics/records', {
                        params: {
                          page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to,
                        },
                      });
                      setMetricRecords(resp.data.list);
                    }}
                    disabled={!metricForm.metricId || !metricForm.value}
                  >
                    {t('actions.save')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Home;
