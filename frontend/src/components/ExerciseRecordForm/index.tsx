import React from 'react';
import dayjs from 'dayjs';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '@shared/Exercise.model';
import Input from '@uikit/components/Input/Input';
import Button from '@uikit/components/Button/Button';
import DatePicker from '@uikit/components/DatePicker/DatePicker';
import styles from './styles.module.css';
import { getLastRecordDefaults } from '../../utils/lastRecordDefaults';

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
  const isEditing = Boolean(form.exerciseId);
  const [step, setStep] = React.useState<'pickExercise' | 'details'>(isEditing ? 'details' : 'pickExercise');
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (form.exerciseId) {
      setStep('details');
      return;
    }
    if (!isEditing) {
      setStep('pickExercise');
    }
  }, [form.exerciseId, isEditing]);

  const selectedExercise = React.useMemo(
    () => exercises.find((x) => x._id === form.exerciseId) ?? null,
    [exercises, form.exerciseId],
  );

  const filteredExercises = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((e) => e.name.toLowerCase().includes(q));
  }, [exercises, query]);

  const pickExercise = (e: Exercise) => {
    const defaults = getLastRecordDefaults(e._id);
    onChange({
      ...form,
      exerciseId: e._id,
      kind: e.type,
      repsAmount: defaults?.repsAmount ?? form.repsAmount,
      durationMs: defaults?.durationMs ?? form.durationMs,
      weight: defaults?.weight ?? '0',
    });
    setStep('details');
  };

  return (
    <div className={styles.root}>
      {step === 'pickExercise' ? (
        <div className={styles.step}>
          <Input
            value={query}
            onChange={(evt) => setQuery((evt.target as HTMLInputElement).value)}
            placeholder={t('records.exercise')}
            aria-label={t('records.exercise')}
          />
          <div className={styles.exerciseList} role="list">
            {filteredExercises.length ? (
              filteredExercises.map((e) => (
                <Button
                  key={e._id}
                  type="ghost"
                  size="md"
                  className={styles.exerciseItem}
                  onClick={() => pickExercise(e)}
                >
                  {e.name}
                </Button>
              ))
            ) : (
              <div className={styles.emptyListText}>No exercises found</div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.selectedRow}>
            <div className={styles.selectedName}>
              {selectedExercise?.name ?? t('records.exercise')}
            </div>
            {!isEditing && (
              <Button
                type="ghost"
                size="sm"
                onClick={() => {
                  onChange({ ...form, exerciseId: '' });
                  setQuery('');
                  setStep('pickExercise');
                }}
              >
                Change
              </Button>
            )}
          </div>
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
        </>
      )}
    </div>
  );
}
