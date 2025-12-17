import React from 'react';
import dayjs from 'dayjs';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '@shared/Exercise.model';
import Input from '@uikit/components/Input/Input';
import Dropdown from '@uikit/components/Dropdown/Dropdown';
import Button from '@uikit/components/Button/Button';
import DatePicker from '@uikit/components/DatePicker/DatePicker';
import styles from './styles.module.css';

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
    <div className={styles.root}>
      <Dropdown
        header={
          form.exerciseId
            ? (exercises.find((x) => x._id === form.exerciseId)?.name || t('records.exercise'))
            : t('records.exercise')
        }
      >
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '8px', padding: 8, maxHeight: 240, overflow: 'auto',
        }}
        >
          {exercises.map((e) => (
            <Button
              key={e._id}
              onClick={() => onChange({ ...form, exerciseId: e._id, kind: e.type })}
            >
              {e.name}
            </Button>
          ))}
        </div>
      </Dropdown>
      {isMobile ? (
        <Input
          label={t('records.date')}
          type="date"
          value={dateValue.format('YYYY-MM-DD')}
          onChange={(e) => {
            const d = dayjs((e.target as HTMLInputElement).value);
            if (d.isValid()) onChange({ ...form, date: d.startOf('day').toISOString() });
          }}
          max={today.format('YYYY-MM-DD')}
        />
      ) : (
        <DatePicker
          label={t('records.date')}
          value={dateValue.toISOString()}
          onChange={(iso) => {
            if (iso) onChange({ ...form, date: dayjs(iso).startOf('day').toISOString() });
          }}
          maxDate={today}
        />
      )}
      {form.kind === 'REPS' ? (
        <Input
          label={t('records.reps')}
          type="number"
          value={form.repsAmount || ''}
          onChange={(e) => onChange({ ...form, repsAmount: (e.target as HTMLInputElement).value })}
        />
      ) : (
        <Input
          label={t('records.durationMin')}
          type="number"
          value={form.durationMs ? String(Math.round(Number(form.durationMs) / 60000)) : ''}
          onChange={(e) => {
            const minutesStr = (e.target as HTMLInputElement).value;
            if (minutesStr === '') {
              onChange({ ...form, durationMs: undefined });
              return;
            }
            const minutes = Number(minutesStr);
            if (Number.isFinite(minutes) && minutes >= 0) {
              onChange({ ...form, durationMs: String(Math.round(minutes * 60000)) });
            }
          }}
        />
      )}
      <Input
        label={t('records.weightKg')}
        type="number"
        value={form.weight || ''}
        onChange={(e) => onChange({ ...form, weight: (e.target as HTMLInputElement).value })}
      />
      {/* <Input */}
      {/*  label={t('records.note')} */}
      {/*  value={form.note || ''} */}
      {/*  onChange={(e) => onChange({ ...form, note: (e.target as HTMLInputElement).value })} */}
      {/* /> */}
    </div>
  );
}
