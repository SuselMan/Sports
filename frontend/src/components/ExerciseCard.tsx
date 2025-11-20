import React from 'react';
import { Box, IconButton, Stack, Typography, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';

export type Exercise = { _id: string; name: string; type: 'REPS' | 'TIME'; muscles: string[] };

export function ExerciseCard({
  exercise,
  onDelete,
  onOpen,
}: {
  exercise: Exercise;
  onDelete?: (id: string) => void;
  onOpen?: (exercise: Exercise) => void;
}) {
  return (
    <Box
      sx={{ p: { xs: 1, sm: 1.5 }, border: '1px solid #eee', borderRadius: 1, cursor: 'pointer' }}
      onClick={() => onOpen?.(exercise)}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Box>
          <Typography variant="subtitle2">{exercise.name}</Typography>
          <Typography variant="caption" display="block">Type: {exercise.type}</Typography>
          <Typography variant="caption" display="block">Muscles: {exercise.muscles.join(', ')}</Typography>
        </Box>
        <Tooltip title="Delete">
          <IconButton
            edge="end"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(exercise._id);
            }}
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}


