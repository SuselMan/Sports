import React from 'react';
import { Stack, TextField, MenuItem } from '@mui/material';
import dayjs from 'dayjs';
import { isMobile } from 'react-device-detect';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '../../../shared/Exercise.model';

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
  const today = dayjs();
  const dateValue = dayjs(form.date);
  const { t } = useTranslation();

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField
        select
        label={t('records.exercise')}
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
      {isMobile ? (
        <TextField
          label={t('records.date')}
          type="date"
          value={dateValue.format('YYYY-MM-DD')}
          onChange={(e) => {
            const d = dayjs(e.target.value);
            if (d.isValid()) onChange({ ...form, date: d.startOf('day').toISOString() });
          }}
          inputProps={{ max: today.format('YYYY-MM-DD') }}
        />
      ) : (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={t('records.date')}
            value={dateValue}
            onChange={(d) => {
              if (d) onChange({ ...form, date: d.startOf('day').toISOString() });
            }}
            disableFuture
            maxDate={today}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </LocalizationProvider>
      )}
      {form.kind === 'REPS' ? (
        <TextField
          label={t('records.reps')}
          type="number"
          value={form.repsAmount || ''}
          onChange={(e) => onChange({ ...form, repsAmount: e.target.value })}
        />
      ) : (
        <TextField
          label={t('records.durationMs')}
          type="number"
          value={form.durationMs || ''}
          onChange={(e) => onChange({ ...form, durationMs: e.target.value })}
        />
      )}
      <TextField
        label={t('records.weightKg')}
        type="number"
        value={form.weight || ''}
        onChange={(e) => onChange({ ...form, weight: e.target.value })}
      />
      <TextField
        label={t('records.note')}
        value={form.note || ''}
        onChange={(e) => onChange({ ...form, note: e.target.value })}
        multiline
      />
    </Stack>
  );
}


