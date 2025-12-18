import React from 'react';
import dayjs from 'dayjs';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import type { Metric } from '@shared/Metrics.model';
import Input from '@uikit/components/Input/Input';
import Button from '@uikit/components/Button/Button';
import DatePicker from '@uikit/components/DatePicker/DatePicker';
import styles from './styles.module.css';

export type MetricRecordFormValue = {
  metricId: string;
  value?: string;
  date: string;
  note?: string;
};

export function MetricRecordForm({
  metrics,
  form,
  onChange,
}: {
  metrics: Metric[];
  form: MetricRecordFormValue;
  onChange: (next: MetricRecordFormValue) => void;
}) {
  const today = dayjs();
  const dateValue = dayjs(form.date);
  const { t } = useTranslation();
  const isEditing = Boolean(form.metricId);
  const [step, setStep] = React.useState<'pickMetric' | 'details'>(isEditing ? 'details' : 'pickMetric');
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (form.metricId) {
      setStep('details');
      return;
    }
    if (!isEditing) {
      setStep('pickMetric');
    }
  }, [form.metricId, isEditing]);

  const selectedMetric = React.useMemo(
    () => metrics.find((x) => x._id === form.metricId) ?? null,
    [metrics, form.metricId],
  );

  const filteredMetrics = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return metrics;
    return metrics.filter((m) => m.name.toLowerCase().includes(q));
  }, [metrics, query]);

  const pickMetric = (m: Metric) => {
    onChange({
      ...form,
      metricId: m._id,
    });
    setStep('details');
  };

  return (
    <div className={styles.root}>
      {step === 'pickMetric' ? (
        <div className={styles.step}>
          <Input
            value={query}
            onChange={(evt) => setQuery((evt.target as HTMLInputElement).value)}
            placeholder={t('metricRecords.metric')}
            aria-label={t('metricRecords.metric')}
          />
          <div className={styles.metricList} role="list">
            {filteredMetrics.length ? (
              filteredMetrics.map((m) => (
                <Button
                  key={m._id}
                  type="ghost"
                  size="md"
                  className={styles.metricItem}
                  onClick={() => pickMetric(m)}
                >
                  {m.name}
                </Button>
              ))
            ) : (
              <div className={styles.emptyListText}>No metrics found</div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className={styles.selectedRow}>
            <div className={styles.selectedName}>
              {selectedMetric?.name ?? t('metricRecords.metric')}
            </div>
            {!isEditing && (
              <Button
                type="ghost"
                size="sm"
                onClick={() => {
                  onChange({ ...form, metricId: '' });
                  setQuery('');
                  setStep('pickMetric');
                }}
              >
                Change
              </Button>
            )}
          </div>

          {isMobile ? (
            <Input
              label={t('metricRecords.date')}
              type="date"
              value={dateValue.format('YYYY-MM-DD')}
              onChange={(e) => {
                const d = dayjs((e.target as HTMLInputElement).value);
                if (d.isValid()) onChange({ ...form, date: d.startOf('day').toISOString() });
              }}
              max={today.format('YYYY-MM-DD')}
            />
          ) : (
            <DatePicker
              label={t('metricRecords.date')}
              value={dateValue.toISOString()}
              onChange={(iso) => {
                if (iso) onChange({ ...form, date: dayjs(iso).startOf('day').toISOString() });
              }}
              maxDate={today}
            />
          )}

          <Input
            label={`${t('metricRecords.value')}${selectedMetric?.unit ? ` (${selectedMetric.unit})` : ''}`}
            type="number"
            value={form.value || ''}
            onChange={(e) => onChange({ ...form, value: (e.target as HTMLInputElement).value })}
          />

          {/* <Input
            label={t('metricRecords.note')}
            value={form.note || ''}
            onChange={(e) => onChange({ ...form, note: (e.target as HTMLInputElement).value })}
          /> */}
        </>
      )}
    </div>
  );
}


