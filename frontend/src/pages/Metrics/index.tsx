import React, { useEffect, useState } from 'react';
import Button from '@uikit/components/Button/Button';
import Modal from '@uikit/components/Modal/Modal';
import Dropdown from '@uikit/components/Dropdown/Dropdown';
import Input from '@uikit/components/Input/Input';
import dayjs from 'dayjs';
import type {
  Metric, MetricRecordResponse, MetricListResponse, MetricRecordListResponse,
} from '@shared/Metrics.model';
import type { AxiosResponse } from 'axios';
import { useDateRangeStore } from '../../store/filters';
import { api } from '../../api/client';
import { DateRange } from '../../components/DateRange';
import styles from './styles.module.css';

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
      const met: AxiosResponse<MetricListResponse> = await api.get('/metrics', {
        params: {
          page: 1, pageSize: 100, sortBy: 'name', sortOrder: 'asc',
        },
      });
      setMetrics(met.data.list);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const resp: AxiosResponse<MetricRecordListResponse> = await api.get('/metrics/records', {
        params: {
          page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to,
        },
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
      params: {
        page: 1, pageSize: 200, sortBy: 'date', sortOrder: 'desc', dateFrom: range.from, dateTo: range.to,
      },
    });
    setRecords(resp.data.list);
  };

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <DateRange value={range} onChange={setRange} />
        <div className={styles.headerActions}>
          <Button onClick={() => setOpen(true)}>Add</Button>
        </div>
      </div>

      <div className={styles.list}>
        {records.map((r) => (
          <div key={r._id} className={styles.card}>
            <div className={styles.value}>{r.value}</div>
            <div className={styles.caption}>{dayjs(r.date).format('L LT')}</div>
          </div>
        ))}
      </div>

      {open && (
        <Modal title="Add Metric Record" close={() => setOpen(false)}>
          <div className={styles.modalCol}>
            <Dropdown
              header={
                form.metricId
                  ? (metrics.find((x) => x._id === form.metricId)?.name || 'Metric')
                  : 'Metric'
              }
            >
              <div className={styles.menuCol}>
                {metrics.map((m) => (
                  <Button key={m._id} onClick={() => setForm((f) => ({ ...f, metricId: m._id }))}>
                    {m.name}
                  </Button>
                ))}
              </div>
            </Dropdown>
            <Input label="Value" type="number" value={form.value || ''} onChange={(e) => setForm((f) => ({ ...f, value: (e.target as HTMLInputElement).value }))} />
            <Input label="Note" value={form.note || ''} onChange={(e) => setForm((f) => ({ ...f, note: (e.target as HTMLInputElement).value }))} />
            <div className={styles.modalActions}>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={submit}>Save</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
