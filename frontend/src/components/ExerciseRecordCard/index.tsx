import React from 'react';
import { api } from '../../api/client';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { ExerciseRecordResponse } from '@shared/Exercise.model';
import durationPlugin from 'dayjs/plugin/duration';
import styles from './styles.module.css';
import Button from '@uikit/components/Button/Button';
import TrashIcon from '@uikit/icons/trash.svg?react';
import RetryIcon from '@uikit/icons/arrow-path.svg?react';

dayjs.extend(durationPlugin);

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return `0sec`;
  const d = dayjs.duration(ms, 'milliseconds');
  const hours = Math.floor(d.asHours());
  const minutes = d.minutes();
  const seconds = d.seconds();
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}sec`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}sec`;
  }
  return `${seconds}sec`;
}

export function ExerciseRecordCard({
  record,
  onDeleted,
  onRepeated,
  onOpen,
  showMuscles = true,
  showName = true,
  showReps = true,
}: {
  record: ExerciseRecordResponse;
  onDeleted?: (id: string) => void;
  onRepeated?: (rec: ExerciseRecordResponse) => void;
  onOpen?: (rec: ExerciseRecordResponse) => void;
  showMuscles?: boolean;
  showName?: boolean;
  showReps?: boolean;
}) {
  const { t } = useTranslation();
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await api.delete(`/exercises/records/${record._id}`);
    onDeleted?.(record._id);
  };

  const handleRepeat = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const resp = await api.post(`/exercises/${record.exerciseId}/records`, {
      kind: record.kind,
      repsAmount: record.kind === 'REPS' ? record.repsAmount : undefined,
      durationMs: record.kind === 'TIME' ? record.durationMs : undefined,
      date: record.date,
      note: record.note,
      weight: record.weight,
    });
    const created = resp.data as ExerciseRecordResponse;
    const withExercise: ExerciseRecordResponse = { ...created, exercise: record.exercise! };
    onRepeated?.(withExercise);
  };

  return (
    <div
      className={`${styles.root} ${styles.relative} ${onOpen ? styles.clickable : ''}`}
      onClick={() => onOpen?.(record)}
    >
      <Button
        type="ghost"
        size="md"
        aria-label="delete"
        className={styles.iconDelete}
        onClick={handleDelete}
      >
        <TrashIcon />
      </Button>
      <Button
        type="ghost"
        size="md"
        aria-label="repeat"
        className={styles.iconRepeat}
        onClick={handleRepeat}
      >
        <RetryIcon/>
      </Button>
      {showName && (
        <h3>
          {record.exercise?.name || t('records.fallbackExerciseName')}
            {!showReps && (
                <span className={styles.reps}>
            {record.kind === 'REPS'
                ? ` ${record.repsAmount ?? 0}`
                : ` ${formatDuration(record.durationMs ?? 0)}`}
            </span>
            )}
        </h3>
      )}
        {
            showReps && (
                <div className={styles.body}>
                    {record.kind === 'REPS'
                        ? `${t('records.repsLabel')} : ${record.repsAmount ?? 0}`
                        : `${formatDuration(record.durationMs ?? 0)}`}
                </div>
            )
        }
      {showMuscles && !!record.exercise?.muscles?.length && (
        <div className={styles.caption}>
          {t('records.musclesLabel')}: {record.exercise.muscles.join(', ')}
        </div>
      )}
      <div className={styles.caption}>
        {dayjs(record.date).format('DD/MM/YYYY')}
      </div>
    </div>
  );
}


