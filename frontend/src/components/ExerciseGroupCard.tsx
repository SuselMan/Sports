import React from 'react';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { ExerciseRecordCard } from './ExerciseRecordCard';
import type { Exercise, ExerciseRecordResponse } from '../../../shared/Exercise.model';
import { useTranslation } from 'react-i18next';

export function ExerciseGroupCard({
  exercise,
  records,
  onDeleted,
  onRepeated,
  onOpen,
}: {
  exercise?: Exercise;
  records: ExerciseRecordResponse[];
  onDeleted?: (id: string) => void;
  onRepeated?: (rec: ExerciseRecordResponse) => void;
  onOpen?: (rec: ExerciseRecordResponse) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useTranslation();

  const isReps = records[0]?.kind === 'REPS';
  const summary = React.useMemo(() => {
    const tooMany = records.length > 5;
    if (isReps) {
      const parts = records
        .map((r) => (typeof r.repsAmount === 'number' ? r.repsAmount : 0))
        .filter((v) => typeof v === 'number');
      const total = parts.reduce((a, b) => a + b, 0);
      if (tooMany) {
        return `${total} ${t('group.total')}`;
      }
      return `${parts.join(' + ')} (${total} ${t('group.total')})`;
    } else {
      const minutes = records
        .map((r) => (typeof r.durationMs === 'number' ? Math.round((r.durationMs as number) / 60000) : 0))
        .filter((v) => typeof v === 'number');
      const totalMin = minutes.reduce((a, b) => a + b, 0);
      const totalHours = Math.floor(totalMin / 60);
      const remMin = totalMin % 60;
      const totalStr =
        totalHours > 0
          ? `${totalHours}${t('group.h')} ${remMin > 0 ? `${remMin}${t('group.min')} ` : ''}${t('group.total')}`
          : `${totalMin}${t('group.min')} ${t('group.total')}`;
      if (tooMany) {
        return totalStr;
      }
      return `${minutes.map((m) => `${m}${t('group.min')}`).join(' + ')} (${totalStr})`;
    }
  }, [isReps, records, t]);

  return (
    <Box sx={{ p: { xs: 1, sm: 1.5 }, border: '1px solid #eee', borderRadius: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} onClick={() => setIsOpen((v) => !v)} sx={{ cursor: 'pointer' }}>
        <Box sx={{ pr: 1, flex: 1 }}>
          <Typography variant="subtitle2">{exercise?.name}</Typography>
          <Typography variant="body2">{summary}</Typography>
          {!!exercise?.muscles?.length && (
            <Typography variant="caption" color="text.secondary" display="block">
              {t('commonTexts.muscles')}: {exercise.muscles.join(', ')}
            </Typography>
          )}
        </Box>
        <IconButton aria-label="toggle" size="small">
          {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Stack>
      {isOpen && (
        <Box sx={{ mt: 1, pl: 2 }}>
          <Stack spacing={1}>
            {records.map((r) => (
              <ExerciseRecordCard key={r._id} record={r} onDeleted={onDeleted} onRepeated={onRepeated} onOpen={onOpen} showMuscles={false} showName={false} />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}


