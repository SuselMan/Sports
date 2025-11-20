import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import { api } from '../api/client';

export type ExerciseRecord = {
  _id: string;
  kind: 'REPS' | 'TIME';
  exerciseId: string;
  exercise?: { _id: string; name: string; type: 'REPS' | 'TIME'; muscles: string[] };
  repsAmount?: number;
  durationMs?: number;
  date: string;
  note?: string;
  weight?: number;
  rpe?: number;
  restSec?: number;
};

export function ExerciseRecordCard({
  record,
  onDeleted,
  onRepeated,
  onOpen,
}: {
  record: ExerciseRecord;
  onDeleted?: (id: string) => void;
  onRepeated?: (rec: ExerciseRecord) => void;
  onOpen?: (rec: ExerciseRecord) => void;
}) {
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
      rpe: record.rpe,
      restSec: record.restSec,
    });
    const created = resp.data as ExerciseRecord;
    const withExercise: ExerciseRecord = { ...created, exercise: record.exercise };
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
      <Typography variant="subtitle2">
        {record.exercise?.name || 'Exercise'}
      </Typography>
      <Typography variant="body2">
        {record.kind === 'REPS' ? `reps: ${record.repsAmount ?? 0}` : `duration: ${record.durationMs ?? 0} ms`}
      </Typography>
      {!!record.exercise?.muscles?.length && (
        <Typography variant="caption" color="text.secondary" display="block">
          muscles: {record.exercise.muscles.join(', ')}
        </Typography>
      )}
      <Typography variant="caption" display="block">
        {new Date(record.date).toLocaleString()}
      </Typography>
    </Box>
  );
}


