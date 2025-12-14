import React from 'react';
import { Autocomplete, Stack, TextField, MenuItem, Box } from '@mui/material';
import { MUSCLES_OPTIONS } from '../../constants/muscles';
import { Muscles } from '../../../shared/Shared.model';
import { MusclesMap } from '../MusclesMap';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

export type ExerciseFormValue = {
  name: string;
  type: 'REPS' | 'TIME';
  muscles: Muscles[];
};

export function ExerciseForm({
  form,
  onChange,
}: {
  form: ExerciseFormValue;
  onChange: (next: ExerciseFormValue) => void;
}) {
  const { t } = useTranslation();
  const toggleMuscle = (m: Muscles) => {
    const exists = form.muscles.includes(m);
    const next = exists ? form.muscles.filter((x) => x !== m) : [...form.muscles, m];
    onChange({ ...form, muscles: next });
  };

  return (
    <Stack className={styles.root} spacing={2} sx={{ mt: 1 }}>
      <TextField
        label={t('exercises.name')}
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
      />
      <TextField
        select
        label={t('exercises.type')}
        value={form.type}
        onChange={(e) => onChange({ ...form, type: e.target.value as 'REPS' | 'TIME' })}
      >
        <MenuItem value="REPS">{t('exercises.kindReps')}</MenuItem>
        <MenuItem value="TIME">{t('exercises.kindTime')}</MenuItem>
      </TextField>

      <Autocomplete
        multiple
        options={MUSCLES_OPTIONS}
        value={form.muscles}
        onChange={(_, value) => onChange({ ...form, muscles: value })}
        filterSelectedOptions
        renderInput={(params) => (
          <TextField {...params} label={t('exercises.muscles')} placeholder={t('exercises.muscles')} />
        )}
      />

      <Box sx={{ height: { xs: 260, sm: 320 }, border: '1px solid #eee', borderRadius: 1 }}>
        <MusclesMap
          muscles={form.muscles}
          onMuscleClicked={(m: Muscles) => toggleMuscle(m)}
        />
      </Box>
    </Stack>
  );
}


