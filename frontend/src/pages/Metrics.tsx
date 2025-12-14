import React, { useEffect, useState } from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import Button from '@uikit/components/Button/Button';
import { PageHeader } from '../components/PageHeader';
import { api } from '../api/client';
import { useDateRangeStore } from '../store/filters';
import dayjs from 'dayjs';
import type { Metric, MetricRecordResponse, MetricListResponse, MetricRecordListResponse } from '@shared/Metrics.model';
import type { AxiosResponse } from 'axios';

export default function Metrics() {
  const range = useDateRangeStore((s) => s.range);
  const setRange = useDateRangeStore((s) => s.setRange);
  const [records, setRecords] = useState<MetricRecordResponse[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ metricId: string; value?: string; date: string; note?: string }>({
    metricId: '',
    date: dayjs().toISOString(),
  });

  useEffect(() => {
    (async () => {
      const met: AxiosResponse<MetricListResponse> = await api.get('/metrics', { params: { page: 1, pageSize: 100, sortBy: 'name', sortOrder: 'asc' } });
      setMetrics(met.data.list);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const resp: AxiosResponse<MetricRecordListResponse> = await api.get('/metrics/records', {
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
    setForm({ metricId: '', date: dayjs().toISOString() });
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
        right={<Button onClick={() => setOpen(true)}>Add</Button>}
      />

      <Stack spacing={1}>
        {records.map((r) => (
          <Box key={r._id} sx={{ p: { xs: 1, sm: 1.5 }, border: '1px solid #eee', borderRadius: 1 }}>
            <Typography variant="body2">{r.value}</Typography>
            <Typography variant="caption">{dayjs(r.date).format('L LT')}</Typography>
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
          <Button onClick={submit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


