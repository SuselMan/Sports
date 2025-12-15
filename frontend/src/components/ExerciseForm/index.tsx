import React from 'react';
import { Stack, TextField as MuiTextField, Box } from '@mui/material';
import { MUSCLES_OPTIONS } from '../../constants/muscles';
import { Muscles } from '@shared/Shared.model';
import { MusclesMap } from '../MusclesMap';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';
import Input from '@uikit/components/Input/Input';
import Dropdown from '@uikit/components/Dropdown/Dropdown';
import Button from '@uikit/components/Button/Button';
import SearchSelect from '@uikit/components/SearchSelect/SearchSelect';

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

  const onClear = () => {
      onChange({ ...form, muscles: [] });
  }

  return (
    <Stack className={styles.root} spacing={2} sx={{ mt: 1 }}>
      <Input
        label={t('exercises.name')}
        value={form.name}
        onChange={(e) => onChange({ ...form, name: (e.target as HTMLInputElement).value })}
      />
      <Dropdown
        header={`${t('exercises.type')}: ${form.type === 'REPS' ? t('exercises.kindReps') : t('exercises.kindTime')}`}
      >
        <Stack spacing={1} style={{ padding: 8 }}>
          <Button
            onClick={() => onChange({ ...form, type: 'REPS' })}
          >
            {t('exercises.kindReps')}
          </Button>
          <Button
            onClick={() => onChange({ ...form, type: 'TIME' })}
          >
            {t('exercises.kindTime')}
          </Button>
        </Stack>
      </Dropdown>

      <SearchSelect
        options={MUSCLES_OPTIONS}
        selected={form.muscles}
        onChange={(opt, add) => {
          const next = add ? [...form.muscles, opt] : form.muscles.filter((m) => m !== opt);
          onChange({ ...form, muscles: next });
        }}
        onClear={onClear}
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


