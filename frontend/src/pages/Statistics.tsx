import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, TextField, MenuItem } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { useDateRangeStore } from '../store/filters';
import { api } from '../api/client';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { Exercise, ExerciseRecordResponse } from '@shared/Exercise.model';

export default function Statistics() {
  const range = useDateRangeStore((s) => s.range);
  const setRange = useDateRangeStore((s) => s.setRange);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState<string>('');
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecordResponse[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const to = dayjs().endOf('day').toISOString();
    const from = dayjs().subtract(30, 'day').startOf('day').toISOString();
    setRange({ from, to });
  }, [setRange]);

  useEffect(() => {
    (async () => {
      const ex = await api.get('/exercises', { params: { page: 1, pageSize: 200, sortBy: 'name', sortOrder: 'asc' } });
      setExercises(ex.data.list);
      if (ex.data.list?.length) setExerciseId(ex.data.list[0]._id);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const resp = await api.get('/exercises/records', {
        params: { page: 1, pageSize: 2000, sortBy: 'date', sortOrder: 'asc', dateFrom: range.from, dateTo: range.to },
      });
      setExerciseRecords(resp.data.list);
    })();
  }, [range]);

  const repsSeries = useMemo(
    () =>
      exerciseRecords
        .filter((r) => r.exerciseId === exerciseId && r.kind === 'REPS' && typeof r.repsAmount === 'number')
        .map((r) => ({ x: dayjs(r.date).format('L'), y: r.repsAmount as number })),
    [exerciseRecords, exerciseId],
  );
  const weightSeries = useMemo(
    () =>
      exerciseRecords
        .filter((r) => r.exerciseId === exerciseId && typeof r.weight === 'number')
        .map((r) => ({ x: dayjs(r.date).format('L'), y: r.weight as number })),
    [exerciseRecords, exerciseId],
  );
  const setsPerDay = useMemo(() => {
    const map = new Map<string, number>();
    exerciseRecords
      .filter((r) => r.exerciseId === exerciseId)
      .forEach((r) => {
        const key = dayjs(r.date).format('L');
        map.set(key, (map.get(key) || 0) + 1);
      });
    return Array.from(map.entries()).map(([x, y]) => ({ x, y }));
  }, [exerciseRecords, exerciseId]);
  const overallRepsPerDay = useMemo(() => {
    const map = new Map<string, number>();
    exerciseRecords
      .filter((r) => r.kind === 'REPS' && typeof r.repsAmount === 'number')
      .forEach((r) => {
        const key = dayjs(r.date).format('L');
        map.set(key, (map.get(key) || 0) + (r.repsAmount as number));
      });
    return Array.from(map.entries()).map(([x, y]) => ({ x, y }));
  }, [exerciseRecords]);

  return (
    <Box>
      <PageHeader
        title={t('statistics.title')}
        range={range}
        onChange={setRange}
        right={
          <TextField fullWidth select size="small" label={t('statistics.exerciseLabel')} value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
            {exercises.map((ex) => (
              <MenuItem key={ex._id} value={ex._id}>{ex.name}</MenuItem>
            ))}
          </TextField>
        }
      />
      <Typography variant="subtitle1" sx={{ mb: 1 }}>{t('statistics.chartRepsPerSet')}</Typography>
      <Box sx={{ height: { xs: 200, sm: 240 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={repsSeries}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#ef6c00" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Typography variant="subtitle1" sx={{ my: 1 }}>{t('statistics.chartWeight')}</Typography>
      <Box sx={{ height: { xs: 200, sm: 240 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weightSeries}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#2e7d32" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Typography variant="subtitle1" sx={{ my: 1 }}>{t('statistics.chartSetsPerDay')}</Typography>
      <Box sx={{ height: { xs: 200, sm: 240 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={setsPerDay}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#6a1b9a" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Typography variant="subtitle1" sx={{ my: 1 }}>{t('statistics.chartOverallRepsPerDay')}</Typography>
      <Box sx={{ height: { xs: 200, sm: 240 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={overallRepsPerDay}>
            <CartesianGrid stroke="#eee" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#d32f2f" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}


