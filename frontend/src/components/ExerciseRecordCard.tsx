import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import { api } from '../api/client';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import type { ExerciseRecordResponse } from '../../../shared/Exercise.model';
import durationPlugin from 'dayjs/plugin/duration';

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
}: {
  record: ExerciseRecordResponse;
  onDeleted?: (id: string) => void;
  onRepeated?: (rec: ExerciseRecordResponse) => void;
  onOpen?: (rec: ExerciseRecordResponse) => void;
  showMuscles?: boolean;
  showName?: boolean;
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
    <Box
      sx={{ p: { xs: 1, sm: 1.5 }, border: '1px solid #eee', borderRadius: 1, position: 'relative', cursor: onOpen ? 'pointer' : 'default' }}
      onClick={() => onOpen?.(record)}
    >
      <IconButton
        aria-label="delete"
        onClick={handleDelete}
        size="small"
        sx={{ position: 'absolute', top: 4, right: 4 }}
      >
        <DeleteOutlineIcon fontSize="small" />
      </IconButton>
      <IconButton
        aria-label="repeat"
        onClick={handleRepeat}
        size="small"
        sx={{ position: 'absolute', top: 4, right: 36 }}
      >
        <ReplayIcon fontSize="small" />
      </IconButton>
      {showName && (
        <Typography variant="subtitle2">
          {record.exercise?.name || t('records.fallbackExerciseName')}
        </Typography>
      )}
      <Typography variant="body2">
        {record.kind === 'REPS'
          ? `${t('records.repsLabel')}: ${record.repsAmount ?? 0}`
          : `${t('records.durationLabel')}: ${formatDuration(record.durationMs ?? 0)}`}
      </Typography>
      {showMuscles && !!record.exercise?.muscles?.length && (
        <Typography variant="caption" color="text.secondary" display="block">
          {t('records.musclesLabel')}: {record.exercise.muscles.join(', ')}
        </Typography>
      )}
      <Typography variant="caption" display="block">
        {dayjs(record.date).format('L LT')}
      </Typography>
    </Box>
  );
}


