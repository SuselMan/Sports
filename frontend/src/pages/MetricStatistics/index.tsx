import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import Spinner from '@uikit/components/Spinner/Spinner';
import EmptyView from '@uikit/components/EmptyView/EmptyView';
import Card from '@uikit/components/Card/Card';
import type { Metric, MetricRecordResponse } from '@shared/Metrics.model';
import { useMetricStatisticsDateRangeStore } from '../../store/filters';
import { DateRange } from '../../components/DateRange';
import { useDbReload } from '../../offline/hooks';
import { getMetricRecordsLocal, getMetricsLocal } from '../../offline/repo';
import styles from './styles.module.css';

function useCssVar(name: string, fallback: string): string {
  const read = () => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  const [value, setValue] = React.useState(read);
  useEffect(() => {
    setValue(read());
    const observer = new MutationObserver(() => setValue(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);
  return value;
}

export default function MetricStatistics() {
  const range = useMetricStatisticsDateRangeStore((s) => s.range);
  const setRange = useMetricStatisticsDateRangeStore((s) => s.setRange);
  const navigate = useNavigate();
  const params = useParams();
  const metricId = (params.metricId || '').trim();
  const { t } = useTranslation();
  const gridColor = useCssVar('--chart-grid-color', 'rgba(0,0,0,0.1)');

  const metricsLoader = React.useCallback(() => getMetricsLocal(), []);
  const { data: allMetrics, loading: isLoadingMetrics } = useDbReload<Metric[]>(metricsLoader, []);
  const metrics = useMemo(() => allMetrics.filter((m) => !m.archived), [allMetrics]);

  const recordsLoader = React.useCallback(() => getMetricRecordsLocal(), []);
  const { data: allRecords, loading: isLoadingRecords } = useDbReload<MetricRecordResponse[]>(recordsLoader, []);

  useEffect(() => {
    if (!metricId && metrics.length) {
      navigate(`/metrics/${metrics[0]._id}/statistics`, { replace: true });
    }
  }, [metricId, metrics, navigate]);

  const selectedMetric = useMemo(
    () => metrics.find((m) => m._id === metricId) ?? null,
    [metrics, metricId],
  );

  const metricRecords = useMemo(
    () => allRecords.filter(
      (r) => !r.archived && r.metricId === metricId && r.date >= range.from && r.date <= range.to,
    ),
    [allRecords, metricId, range],
  );

  const minValue = useMemo(() => {
    if (!metricRecords.length) return null;
    let min = metricRecords[0].value;
    metricRecords.forEach((r) => {
      if (r.value < min) min = r.value;
    });
    return min;
  }, [metricRecords]);

  const maxValue = useMemo(() => {
    if (!metricRecords.length) return null;
    let max = metricRecords[0].value;
    metricRecords.forEach((r) => {
      if (r.value > max) max = r.value;
    });
    return max;
  }, [metricRecords]);

  const chartSeries = useMemo(
    () => [...metricRecords]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => ({ date: r.date, value: r.value })),
    [metricRecords],
  );

  return (
    <div className={styles.root}>
      <DateRange value={range} onChange={setRange} />

      {(isLoadingMetrics || isLoadingRecords) ? (
        <div className={styles.loading}>
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {!metrics.length ? (
            <EmptyView title={t('commonTexts.noDataForPeriod')} />
          ) : !metricId ? null : !metricRecords.length ? (
            <EmptyView title={t('commonTexts.noDataForPeriod')} />
          ) : (
            <>
              <div className={styles.blockTitle}>
                {selectedMetric?.name ?? t('metrics.title')}
              </div>

              <div className={styles.highlights}>
                <Card className={styles.highlightCard}>
                  <div className={styles.highlightLabel}>{t('statistics.metricMin')}</div>
                  <div className={styles.highlightValue}>
                    {minValue != null ? minValue : '-'}
                    {selectedMetric?.unit ? ` ${selectedMetric.unit}` : ''}
                  </div>
                </Card>
                <Card className={styles.highlightCard}>
                  <div className={styles.highlightLabel}>{t('statistics.metricMax')}</div>
                  <div className={styles.highlightValue}>
                    {maxValue != null ? maxValue : '-'}
                    {selectedMetric?.unit ? ` ${selectedMetric.unit}` : ''}
                  </div>
                </Card>
              </div>

              <div className={styles.blockTitle}>{t('statistics.chartValueOverTime')}</div>
              <div className={styles.chartBox}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartSeries}>
                    <CartesianGrid stroke={gridColor} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => dayjs(d).format('DD/MM')}
                    />
                    <YAxis width={35} />
                    <Tooltip
                      labelFormatter={(d) => dayjs(String(d)).format('DD/MM/YYYY')}
                      formatter={(v: number) => [v, selectedMetric?.unit ?? '']}
                    />
                    <Line type="monotone" dataKey="value" stroke="#1976d2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
