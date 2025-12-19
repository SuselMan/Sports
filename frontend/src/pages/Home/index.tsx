import React, { useMemo, useState } from 'react';
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
} from '@shared/Exercise.model';
import type { Metric, MetricRecordResponse } from '@shared/Metrics.model';
import { setLastRecordDefaults } from '../../utils/lastRecordDefaults';
import { DateRange } from '../../components/DateRange';
import { useDateRangeStore } from '../../store/filters';
import { ExerciseRecordCard } from '../../components/ExerciseRecordCard';
import { ExerciseGroupCard } from '../../components/ExerciseGroupCard';
import { ExerciseRecordForm, ExerciseRecordFormValue } from '../../components/ExerciseRecordForm';
import { MetricRecordForm, MetricRecordFormValue } from '../../components/MetricRecordForm';
import { MetricRecordCard } from '../../components/MetricRecordCard';
import { MusclesMap } from '../../components/MusclesMap';
import { AddFab } from '../../components/AddFab';
import { useModalBackClose } from '../../hooks/useModalBackClose';
import { useDbReload } from '../../offline/hooks';
import {
  getExerciseRecordsLocal,
  getExercisesLocal,
  getMetricRecordsLocal,
  getMetricsLocal,
} from '../../offline/repo';
import { upsertExerciseRecordLocal, upsertMetricRecordLocal } from '../../offline/mutations';
import styles from './styles.module.css';

const Home: React.FC = () => {
  const range = useDateRangeStore((s) => s.range);
  const setRange = useDateRangeStore((s) => s.setRange);
  const { t } = useTranslation();
  const exercisesLoader = React.useCallback(() => getExercisesLocal(), []);
  const { data: allExercises, loading: isLoadingExercises } = useDbReload<Exercise[]>(exercisesLoader, []);
  const metricsLoader = React.useCallback(() => getMetricsLocal(), []);
  const { data: allMetrics, loading: isLoadingMetrics } = useDbReload<Metric[]>(metricsLoader, []);
  const exerciseRecordsLoader = React.useCallback(() => getExerciseRecordsLocal(), []);
  const { data: allExerciseRecords, loading: isLoadingRecords } = useDbReload<ExerciseRecordResponse[]>(exerciseRecordsLoader, []);
  const metricRecordsLoader = React.useCallback(() => getMetricRecordsLocal(), []);
  const { data: allMetricRecords, loading: isLoadingMetricRecords } = useDbReload<MetricRecordResponse[]>(metricRecordsLoader, []);

  const exercises = useMemo(() => allExercises.filter((e) => !e.archived), [allExercises]);
  const metrics = useMemo(() => allMetrics.filter((m) => !m.archived), [allMetrics]);

  const exerciseById = useMemo(() => new Map(exercises.map((e) => [e._id, e])), [exercises]);
  const metricById = useMemo(() => new Map(metrics.map((m) => [m._id, m])), [metrics]);

  const records = useMemo(() => allExerciseRecords
    .filter((r) => !r.archived)
    .filter((r) => r.date >= range.from && r.date <= range.to)
    .map((r) => ({ ...r, exercise: r.exercise ?? exerciseById.get(r.exerciseId) }))
    .filter((r) => !!r.exercise) as ExerciseRecordResponse[], [allExerciseRecords, range, exerciseById]);

  const metricRecords = useMemo(() => allMetricRecords
    .filter((r) => !r.archived)
    .filter((r) => r.date >= range.from && r.date <= range.to)
    .map((r) => ({ ...r, metric: r.metric ?? metricById.get(r.metricId) }))
    .filter((r) => !!r.metric) as MetricRecordResponse[], [allMetricRecords, range, metricById]);
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
    await upsertExerciseRecordLocal({
      exerciseId: form.exerciseId,
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
  };

  const submitMetric = async () => {
    if (!metricForm.metricId || !metricForm.value) return;
    await upsertMetricRecordLocal({
      metricId: metricForm.metricId,
      value: Number(metricForm.value),
      date: metricForm.date,
      note: metricForm.note || undefined,
    });
    setCurrentModal(null);
    setMetricForm({ metricId: '', date: range.from });
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
                      await upsertExerciseRecordLocal({
                        _id: editId,
                        exerciseId: form.exerciseId,
                        kind: form.kind,
                        repsAmount: form.kind === 'REPS' ? Number(form.repsAmount) : undefined,
                        durationMs: form.kind === 'TIME' ? Number(form.durationMs) : undefined,
                        date: form.date,
                        weight: form.weight ? Number(form.weight) : undefined,
                        note: form.note || undefined,
                      });
                      setCurrentModal(null);
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
                      await upsertMetricRecordLocal({
                        _id: metricEditId,
                        metricId: metricForm.metricId,
                        value: metricForm.value != null ? Number(metricForm.value) : 0,
                        date: metricForm.date,
                        note: metricForm.note || undefined,
                      });
                      setCurrentModal(null);
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
