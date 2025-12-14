import React from 'react';
import { Box, IconButton, Stack, Typography, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '@shared/Exercise.model';
import styles from './styles.module.css';

export function ExerciseCard({
  exercise,
  onDelete,
  onOpen,
}: {
  exercise: Exercise;
  onDelete?: (id: string) => void;
  onOpen?: (exercise: Exercise) => void;
}) {
  const { t } = useTranslation();
  return (
    <Box
      className={styles.root}
      sx={{ p: { xs: 1, sm: 1.5 }, border: '1px solid #eee', borderRadius: 1, cursor: 'pointer' }}
      onClick={() => onOpen?.(exercise)}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
        <Box>
          <Typography variant="subtitle2">{exercise.name}</Typography>
          <Typography variant="caption" display="block">{t('commonTexts.type')}: {exercise.type}</Typography>
          <Typography variant="caption" display="block">{t('commonTexts.muscles')}: {exercise.muscles.join(', ')}</Typography>
        </Box>
        <Tooltip title={t('exercises.delete')}>
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


