import React, { useEffect, useMemo, useState } from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import Button from '@uikit/components/Button/Button';
import { PageHeader } from '../../components/PageHeader';
import { api } from '../../api/client';
import { useDateRangeStore } from '../../store/filters';
import { ExerciseRecordCard } from '../../components/ExerciseRecordCard';
import { ExerciseGroupCard } from '../../components/ExerciseGroupCard';
import { ExerciseRecordForm, ExerciseRecordFormValue } from '../../components/ExerciseRecordForm';
import { MusclesMap } from '../../components/MusclesMap';
import { Muscles } from '../../../../shared/Shared.model';
import { AddFab } from '../../components/AddFab';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useModalBackClose } from '../../hooks/useModalBackClose';
import {
    Exercise,
    ExerciseRecordResponse,
    ExerciseRecordsListResponse,
    ExerciseListResponse,
} from '../../../../shared/Exercise.model';
import {AxiosResponse} from "axios";

export default function Home() {
  const range = useDateRangeStore((s) => s.range);
  const setRange = useDateRangeStore((s) => s.setRange);
  const { t } = useTranslation();
  const [records, setRecords] = useState<ExerciseRecordResponse[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ExerciseRecordFormValue>({
    exerciseId: '',
    kind: 'REPS',
    date: range.from,
  });

  useEffect(() => {
    (async () => {
      const ex: AxiosResponse<ExerciseListResponse> = await api.get('/exercises', { params: { page: 1, pageSize: 100, sortBy: 'name', sortOrder: 'asc' } });
      setExercises(ex.data.list);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const resp: AxiosResponse<ExerciseRecordsListResponse> = await api.get('/exercises/records', {
        params: { page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to },
      });
      setRecords(resp.data.list);
    })();
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
    () =>
      Array.from(
        new Set(
          records.flatMap((r) => (r.exercise?.muscles ? r.exercise.muscles : []))
        )
      ) as Muscles[],
    [records]
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
    setOpen(false);
    setForm({ exerciseId: '', kind: 'REPS', date: range.from });
    const resp = await api.get('/exercises/records', {
      params: { page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to },
    });
    setRecords(resp.data.list);
  };

  // Close dialogs on mobile back button
  useModalBackClose(open, () => setOpen(false));
  useModalBackClose(editOpen, () => setEditOpen(false));

  return (
    <Box>
      <PageHeader title="Home" range={range} onChange={setRange} />

      {!!records.length && (
        <Box sx={{ my: 2, height: { xs: 260, sm: 320 } }}>
          <MusclesMap muscles={highlightedMuscles} onMuscleClicked={() => {}} />
        </Box>
      )}

      <Stack spacing={1}>
        {groups.map((g) =>
          g.records.length === 1 ? (
            <ExerciseRecordCard
              key={g.records[0]._id}
              record={g.records[0]}
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
          )
        )}
        {!records.length && (
          exercises.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('home.noExercisesPrefix')}{' '}
              <RouterLink to="/exercises?createNew=true">{t('home.createFirstOne')}</RouterLink>{' '}
              {t('home.noExercisesSuffix')}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('home.noRecordsForPeriod')}
            </Typography>
          )
        )}
      </Stack>
        {
            !!exercises.length && (
                <AddFab onClick={() => { setForm({ exerciseId: '', kind: 'REPS', date: range.from }); setOpen(true); }} />
            )
        }
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{t('records.addTitle')}</DialogTitle>
        <DialogContent>
          <ExerciseRecordForm exercises={exercises} form={form} onChange={setForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('actions.cancel')}</Button>
          <Button onClick={submit}>{t('actions.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>{t('records.editTitle')}</DialogTitle>
        <DialogContent>
          <ExerciseRecordForm exercises={exercises} form={form} onChange={setForm} />
        </DialogContent>
        <DialogActions>
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
                params: { page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to },
              });
              setRecords(resp.data.list);
            }}
          >
            {t('actions.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


