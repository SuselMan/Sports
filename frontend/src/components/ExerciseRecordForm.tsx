import React from 'react';
import { Stack, TextField, MenuItem } from '@mui/material';

type Exercise = { _id: string; name: string; type: 'REPS' | 'TIME' };

export type ExerciseRecordFormValue = {
  exerciseId: string;
  kind: 'REPS' | 'TIME';
  repsAmount?: string;
  durationMs?: string;
  date: string;
  weight?: string;
  note?: string;
};

export function ExerciseRecordForm({
  exercises,
  form,
  onChange,
}: {
  exercises: Exercise[];
  form: ExerciseRecordFormValue;
  onChange: (next: ExerciseRecordFormValue) => void;
}) {
  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField
        select
        label="Exercise"
        value={form.exerciseId}
        onChange={(e) => {
          const ex = exercises.find((x) => x._id === e.target.value);
          onChange({ ...form, exerciseId: e.target.value, kind: ex?.type || 'REPS' });
        }}
      >
        {exercises.map((e) => (
          <MenuItem key={e._id} value={e._id}>{e.name}</MenuItem>
        ))}
      </TextField>
      {form.kind === 'REPS' ? (
        <TextField
          label="Reps"
          type="number"
          value={form.repsAmount || ''}
          onChange={(e) => onChange({ ...form, repsAmount: e.target.value })}
        />
      ) : (
        <TextField
          label="Duration (ms)"
          type="number"
          value={form.durationMs || ''}
          onChange={(e) => onChange({ ...form, durationMs: e.target.value })}
        />
      )}
      <TextField
        label="Weight (kg)"
        type="number"
        value={form.weight || ''}
        onChange={(e) => onChange({ ...form, weight: e.target.value })}
      />
      <TextField
        label="Note"
        value={form.note || ''}
        onChange={(e) => onChange({ ...form, note: e.target.value })}
        multiline
      />
    </Stack>
  );
}


