import React, { useEffect, useState } from 'react';
import { Box, Stack, TextField, Typography } from '@mui/material';
import Button from '@uikit/components/Button/Button';
import { DateRange } from '../components/DateRange';
import Modal from '@uikit/components/Modal/Modal';
import Dropdown from '@uikit/components/Dropdown/Dropdown';
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
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
        <DateRange value={range} onChange={setRange} />
        <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' } }}>
          <Button onClick={() => setOpen(true)}>Add</Button>
        </Box>
      </Stack>

      <Stack spacing={1}>
        {records.map((r) => (
          <Box key={r._id} sx={{ p: { xs: 1, sm: 1.5 }, border: '1px solid #eee', borderRadius: 1 }}>
            <Typography variant="body2">{r.value}</Typography>
            <Typography variant="caption">{dayjs(r.date).format('L LT')}</Typography>
          </Box>
        ))}
      </Stack>

      {open && (
        <Modal title="Add Metric Record" close={() => setOpen(false)}>
          <Stack spacing={2} style={{ marginTop: 4 }}>
            <Dropdown
              header={
                form.metricId
                  ? (metrics.find((x) => x._id === form.metricId)?.name || 'Metric')
                  : 'Metric'
              }
            >
              <Stack spacing={1} style={{ padding: 8, maxHeight: 240, overflow: 'auto' }}>
                {metrics.map((m) => (
                  <Button key={m._id} onClick={() => setForm((f) => ({ ...f, metricId: m._id }))}>
                    {m.name}
                  </Button>
                ))}
              </Stack>
            </Dropdown>
            <TextField label="Value" type="number" value={form.value || ''} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} />
            <TextField label="Note" value={form.note || ''} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} multiline />
            <Stack direction="row" spacing={1} style={{ justifyContent: 'flex-end' }}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit}>Save</Button>
            </Stack>
          </Stack>
        </Modal>
      )}
    </Box>
  );
}


