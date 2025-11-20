import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { api } from '../api/client';
import { useDateRangeStore } from '../store/filters';
import { ExerciseRecordCard } from '../components/ExerciseRecordCard';
import { ExerciseRecordForm, ExerciseRecordFormValue } from '../components/ExerciseRecordForm';
import { MusclesMap } from '../components/MusclesMap';
import { Muscles } from '../../../docs/Shared.model';
import { AddFab } from '../components/AddFab';

type Exercise = { _id: string; name: string; type: 'REPS' | 'TIME' };
type ExerciseRecord = {
  _id: string;
  kind: 'REPS' | 'TIME';
  exerciseId: string;
  exercise?: { _id: string; name: string; type: 'REPS' | 'TIME'; muscles: string[] };
  repsAmount?: number;
  durationMs?: number;
  date: string;
  note?: string;
  weight?: number;
};

export default function Home() {
  const range = useDateRangeStore((s) => s.range);
  const setRange = useDateRangeStore((s) => s.setRange);
  const [records, setRecords] = useState<ExerciseRecord[]>([]);
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
      const ex = await api.get('/exercises', { params: { page: 1, pageSize: 100, sortBy: 'name', sortOrder: 'asc' } });
      setExercises(ex.data.list);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const resp = await api.get('/exercises/records', {
        params: { page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to },
      });
      setRecords(resp.data.list);
    })();
  }, [range]);

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

  return (
    <Box>
      <PageHeader title="Home" range={range} onChange={setRange} />

      <Box sx={{ my: 2, height: { xs: 260, sm: 320 } }}>
        <MusclesMap muscles={highlightedMuscles} onMuscleClicked={() => {}} />
      </Box>

      <Stack spacing={1}>
        {records.map((r) => (
          <ExerciseRecordCard
            key={r._id}
            record={r}
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
        ))}
        {!records.length && (
          <Typography variant="body2" color="text.secondary">No data for chosen period.</Typography>
        )}
      </Stack>

      <AddFab onClick={() => { setForm({ exerciseId: '', kind: 'REPS', date: range.from }); setOpen(true); }} />

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Add Exercise Record</DialogTitle>
        <DialogContent>
          <ExerciseRecordForm exercises={exercises} form={form} onChange={setForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Edit Exercise Record</DialogTitle>
        <DialogContent>
          <ExerciseRecordForm exercises={exercises} form={form} onChange={setForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
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
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


