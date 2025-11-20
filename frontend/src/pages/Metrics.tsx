import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import { api } from '../api/client';
import { useDateRangeStore } from '../store/filters';

type Metric = { _id: string; name: string; unit: string };
type MetricRecord = { _id: string; metricId: string; value: number; date: string; note?: string };

export default function Metrics() {
  const range = useDateRangeStore((s) => s.range);
  const setRange = useDateRangeStore((s) => s.setRange);
  const [records, setRecords] = useState<MetricRecord[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ metricId: string; value?: string; date: string; note?: string }>({
    metricId: '',
    date: new Date().toISOString(),
  });

  useEffect(() => {
    (async () => {
      const met = await api.get('/metrics', { params: { page: 1, pageSize: 100, sortBy: 'name', sortOrder: 'asc' } });
      setMetrics(met.data.list);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const resp = await api.get('/metrics/records', {
        params: { page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to },
      });
      setRecords(resp.data.list);
    })();
  }, [range]);

  const submit = async () => {
    if (!form.metricId || !form.value) return;
    await api.post(`/metrics/${form.metricId}/records`, {
      value: Number(form.value),
      date: form.date,
      note: form.note || undefined,
    });
    setOpen(false);
    setForm({ metricId: '', date: new Date().toISOString() });
    const resp = await api.get('/metrics/records', {
      params: { page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to },
    });
    setRecords(resp.data.list);
  };

  return (
    <Box>
      <PageHeader
        title="Metrics"
        range={range}
        onChange={setRange}
        right={<Button variant="contained" onClick={() => setOpen(true)}>Add</Button>}
      />

      <Stack spacing={1}>
        {records.map((r) => (
          <Box key={r._id} sx={{ p: { xs: 1, sm: 1.5 }, border: '1px solid #eee', borderRadius: 1 }}>
            <Typography variant="body2">{r.value}</Typography>
            <Typography variant="caption">{new Date(r.date).toLocaleString()}</Typography>
          </Box>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Add Metric Record</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              select
              label="Metric"
              value={form.metricId}
              onChange={(e) => setForm((f) => ({ ...f, metricId: e.target.value }))}
            >
              {metrics.map((m) => (
                <MenuItem key={m._id} value={m._id}>{m.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Value" type="number" value={form.value || ''} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
            <TextField label="Note" value={form.note || ''} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} multiline />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


