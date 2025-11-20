import React, { useEffect, useMemo, useState } from 'react';
import { Box, Stack, Typography, TextField, MenuItem, Divider } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { useDateRangeStore } from '../store/filters';
import { api } from '../api/client';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Metric = { _id: string; name: string };
type MetricRecord = { metricId: string; value: number; date: string };
type Exercise = { _id: string; name: string };
type ExerciseRecord = { exerciseId: string; kind: 'REPS'|'TIME'; repsAmount?: number; durationMs?: number; weight?: number; date: string };

export default function Statistics() {
  const range = useDateRangeStore((s) => s.range);
  const setRange = useDateRangeStore((s) => s.setRange);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [metricId, setMetricId] = useState<string>('');
  const [data, setData] = useState<{ x: string; y: number }[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState<string>('');
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecord[]>([]);

  useEffect(() => {
    (async () => {
      const met = await api.get('/metrics', { params: { page: 1, pageSize: 200, sortBy: 'name', sortOrder: 'asc' } });
      setMetrics(met.data.list);
      if (met.data.list?.length) setMetricId(met.data.list[0]._id);
      const ex = await api.get('/exercises', { params: { page: 1, pageSize: 200, sortBy: 'name', sortOrder: 'asc' } });
      setExercises(ex.data.list);
      if (ex.data.list?.length) setExerciseId(ex.data.list[0]._id);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!metricId) return;
      const resp = await api.get('/metrics/records', {
        params: { page: 1, pageSize: 1000, sortBy: 'date', sortOrder: 'asc', dateFrom: range.from, dateTo: range.to },
      });
      const rows: MetricRecord[] = resp.data.list;
      setData(
        rows
          .filter((r) => r.metricId === metricId)
          .map((r) => ({ x: new Date(r.date).toLocaleDateString(), y: r.value })),
      );
    })();
  }, [metricId, range]);

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
        .map((r) => ({ x: new Date(r.date).toLocaleDateString(), y: r.repsAmount as number })),
    [exerciseRecords, exerciseId],
  );
  const weightSeries = useMemo(
    () =>
      exerciseRecords
        .filter((r) => r.exerciseId === exerciseId && typeof r.weight === 'number')
        .map((r) => ({ x: new Date(r.date).toLocaleDateString(), y: r.weight as number })),
    [exerciseRecords, exerciseId],
  );
  const setsPerDay = useMemo(() => {
    const map = new Map<string, number>();
    exerciseRecords
      .filter((r) => r.exerciseId === exerciseId)
      .forEach((r) => {
        const key = new Date(r.date).toLocaleDateString();
        map.set(key, (map.get(key) || 0) + 1);
      });
    return Array.from(map.entries()).map(([x, y]) => ({ x, y }));
  }, [exerciseRecords, exerciseId]);

  return (
    <Box>
      <PageHeader
        title="Statistics"
        range={range}
        onChange={setRange}
        right={
          <>
            <TextField fullWidth select size="small" label="Metric" value={metricId} onChange={(e) => setMetricId(e.target.value)}>
              {metrics.map((m) => (
                <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>
              ))}
            </TextField>
            <TextField fullWidth select size="small" label="Exercise" value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
              {exercises.map((ex) => (
                <MenuItem key={ex._id} value={ex._id}>{ex.name}</MenuItem>
              ))}
            </TextField>
          </>
        }
      />
      <Box sx={{ height: { xs: 240, sm: 300 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="y" stroke="#1976d2" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Exercise: Total reps per set</Typography>
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
      <Typography variant="subtitle1" sx={{ my: 1 }}>Exercise: Weight</Typography>
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
      <Typography variant="subtitle1" sx={{ my: 1 }}>Exercise: Sets per day</Typography>
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
    </Box>
  );
}


