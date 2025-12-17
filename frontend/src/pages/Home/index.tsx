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
import { AxiosResponse } from 'axios';
import { setLastRecordDefaults } from '../../utils/lastRecordDefaults';
import { DateRange } from '../../components/DateRange';
import { api } from '../../api/client';
import { useDateRangeStore } from '../../store/filters';
import { ExerciseRecordCard } from '../../components/ExerciseRecordCard';
import { ExerciseGroupCard } from '../../components/ExerciseGroupCard';
import { ExerciseRecordForm, ExerciseRecordFormValue } from '../../components/ExerciseRecordForm';
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
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ExerciseRecordFormValue>({
    exerciseId: '',
    kind: 'REPS',
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
    return order.map((k) => map.get(k)!);
  }, [records]);

  const highlightedMuscles = useMemo(
    () => Array.from(
      new Set(
        records.flatMap((r) => (r.exercise?.muscles ? r.exercise.muscles : [])),
      ),
    ) as Muscles[],
    [records],
  );

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
    setOpen(false);
    setForm({ exerciseId: '', kind: 'REPS', date: range.from });
    const resp = await api.get('/exercises/records', {
      params: {
        page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to,
      },
    });
    setRecords(resp.data.list);
  };

  // Close dialogs on mobile back button
  useModalBackClose(open, () => setOpen(false));
  useModalBackClose(editOpen, () => setEditOpen(false));

  const isLoading = isLoadingExercises || isLoadingRecords;
  const openAddRecord = () => {
    setForm({ exerciseId: '', kind: 'REPS', date: range.from });
    setOpen(true);
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
                onRepeated={(rec) => setRecords((prev) => [rec, ...prev])}
                onOpen={(rec) => {
                  setEditId(rec._id);
                  setForm({
                    exerciseId: rec.exerciseId,
                    kind: rec.kind,
                    repsAmount: rec.kind === 'REPS' ? String(rec.repsAmount ?? '') : undefined,
                    durationMs: rec.kind === 'TIME' ? String(rec.durationMs ?? '') : undefined,
                    weight: rec.weight != null ? String(rec.weight) : undefined,
                    note: rec.note,
                    date: rec.date,
                  });
                  setEditOpen(true);
                }}
              />
            ) : (
              <ExerciseGroupCard
                key={g.exercise?._id || g.records[0]._id}
                exercise={g.exercise}
                records={g.records}
                onDeleted={(id) => setRecords((prev) => prev.filter((x) => x._id !== id))}
                onRepeated={(rec) => setRecords((prev) => [rec, ...prev])}
                onOpen={(rec) => {
                  setEditId(rec._id);
                  setForm({
                    exerciseId: rec.exerciseId,
                    kind: rec.kind,
                    repsAmount: rec.kind === 'REPS' ? String(rec.repsAmount ?? '') : undefined,
                    durationMs: rec.kind === 'TIME' ? String(rec.durationMs ?? '') : undefined,
                    weight: rec.weight != null ? String(rec.weight) : undefined,
                    note: rec.note,
                    date: rec.date,
                  });
                  setEditOpen(true);
                }}
              />
            )))}
            {!records.length && (
              exercises.length === 0 ? (
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
                    <Button type="active" size="md" onClick={openAddRecord}>{t('home.addRecordCta')}</Button>
                  </div>
                </EmptyView>
              )
            )}
          </>
        )}
      </div>
      {
            !!exercises.length && (
            <AddFab onClick={openAddRecord} />
            )
        }
      {open && (
        <Modal title={t('records.addTitle')} close={() => setOpen(false)}>
          <div className={styles.modalCol}>
            <ExerciseRecordForm exercises={exercises} form={form} onChange={setForm} />
            <div className={styles.modalActions}>
              <Button onClick={() => setOpen(false)}>{t('actions.cancel')}</Button>
              <Button onClick={submit}>{t('actions.save')}</Button>
            </div>
          </div>
        </Modal>
      )}

      {editOpen && (
        <Modal title={t('records.editTitle')} close={() => setEditOpen(false)}>
          <div className={styles.modalCol}>
            <ExerciseRecordForm exercises={exercises} form={form} onChange={setForm} />
            <div className={styles.modalActions}>
              <Button
                onClick={async () => {
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
                  setEditOpen(false);
                  // Refresh list
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
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Home;
