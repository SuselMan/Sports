import React from 'react';
import { Autocomplete, Stack, TextField, MenuItem, Box } from '@mui/material';
import { MUSCLES_OPTIONS } from '../constants/muscles';
import { Muscles } from '../../../docs/Shared.model';
import { MusclesMap } from './MusclesMap';

export type ExerciseFormValue = {
  name: string;
  type: 'REPS' | 'TIME';
  muscles: string[];
};

export function ExerciseForm({
  form,
  onChange,
}: {
  form: ExerciseFormValue;
  onChange: (next: ExerciseFormValue) => void;
}) {
  const toggleMuscle = (m: Muscles) => {
    const exists = form.muscles.includes(m);
    const next = exists ? form.muscles.filter((x) => x !== m) : [...form.muscles, m];
    onChange({ ...form, muscles: next });
  };

  return (
    <Stack spacing={2} sx={{ mt: 1 }}>
      <TextField
        label="Name"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
      />
      <TextField
        select
        label="Type"
        value={form.type}
        onChange={(e) => onChange({ ...form, type: e.target.value as 'REPS' | 'TIME' })}
      >
        <MenuItem value="REPS">REPS</MenuItem>
        <MenuItem value="TIME">TIME</MenuItem>
      </TextField>

      <Autocomplete
        multiple
        options={MUSCLES_OPTIONS}
        value={form.muscles}
        onChange={(_, value) => onChange({ ...form, muscles: value })}
        filterSelectedOptions
        renderInput={(params) => (
          <TextField {...params} label="Muscles" placeholder="Search muscle..." />
        )}
      />

      <Box sx={{ height: { xs: 260, sm: 320 }, border: '1px solid #eee', borderRadius: 1 }}>
        <MusclesMap
          muscles={form.muscles as unknown as Muscles[]}
          onMuscleClicked={(m: Muscles) => toggleMuscle(m)}
        />
      </Box>
    </Stack>
  );
}


