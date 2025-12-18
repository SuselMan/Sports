import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import Spinner from '@uikit/components/Spinner/Spinner';
import EmptyView from '@uikit/components/EmptyView/EmptyView';
import Card from '@uikit/components/Card/Card';
import type { Exercise, ExerciseRecordResponse } from '@shared/Exercise.model';
import { api } from '../../api/client';
import { useDateRangeStore } from '../../store/filters';
import { DateRange } from '../../components/DateRange';
import styles from './styles.module.css';

function computeE1rm(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

function dayKey(iso: string): string {
  return dayjs(iso).format('YYYY-MM-DD');
}

export default function Statistics() {
  const range = useDateRangeStore((s) => s.range);
  const setRange = useDateRangeStore((s) => s.setRange);
  const navigate = useNavigate();
  const params = useParams();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const exerciseId = (params.exerciseId || '').trim();
  const [exerciseRecords, setExerciseRecords] = useState<ExerciseRecordResponse[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const to = dayjs().endOf('day').toISOString();
    const from = dayjs().subtract(30, 'day').startOf('day').toISOString();
    setRange({ from, to });
  }, [setRange]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingExercises(true);
      try {
        const ex = await api.get('/exercises', {
          params: {
            page: 1, pageSize: 100, sortBy: 'name', sortOrder: 'asc',
          },
        });
        if (cancelled) return;
        setExercises(ex.data.list);
      } finally {
        if (!cancelled) setIsLoadingExercises(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!exerciseId && exercises.length) {
      navigate(`/statistics/${exercises[0]._id}`, { replace: true });
    }
  }, [exerciseId, exercises, navigate]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!exerciseId) {
        setExerciseRecords([]);
        setIsLoadingRecords(false);
        return;
      }
      setIsLoadingRecords(true);
      try {
        const all: ExerciseRecordResponse[] = [];
        const pageSize = 100; // backend cap
        let page = 1;
        let total = Infinity;
        while (!cancelled && all.length < total) {
          const resp = await api.get('/exercises/records', {
            params: {
              page,
              pageSize,
              sortBy: 'date',
              sortOrder: 'asc',
              dateFrom: range.from,
              dateTo: range.to,
              exerciseIds: exerciseId,
            },
          });
          const chunk = resp.data?.list || [];
          all.push(...chunk);
          const t0 = resp.data?.pagination?.total;
          total = typeof t0 === 'number' ? t0 : all.length;
          if (chunk.length === 0) break;
          page += 1;
        }
        if (!cancelled) setExerciseRecords(all);
      } finally {
        if (!cancelled) setIsLoadingRecords(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [range, exerciseId]);

  const selectedExercise = useMemo(
    () => exercises.find((x) => x._id === exerciseId) ?? null,
    [exercises, exerciseId],
  );

  const repsRecords = useMemo(
    () => exerciseRecords.filter((r) => r.kind === 'REPS' && typeof r.repsAmount === 'number'),
    [exerciseRecords],
  );

  const maxRepsSet = useMemo(() => {
    let max = 0;
    repsRecords.forEach((r) => {
      const v = r.repsAmount ?? 0;
      if (typeof v === 'number' && v > max) max = v;
    });
    return max;
  }, [repsRecords]);

  const repsPerDayTotal = useMemo(() => {
    const map = new Map<string, number>();
    repsRecords.forEach((r) => {
      const key = dayKey(r.date);
      map.set(key, (map.get(key) || 0) + (r.repsAmount as number));
    });
    return map;
  }, [repsRecords]);

  const maxRepsDay = useMemo(() => {
    let max = 0;
    repsPerDayTotal.forEach((v) => {
      if (v > max) max = v;
    });
    return max;
  }, [repsPerDayTotal]);

  const dailyMaxRepsSeries = useMemo(() => {
    const map = new Map<string, number>();
    repsRecords.forEach((r) => {
      const key = dayKey(r.date);
      const v = r.repsAmount as number;
      map.set(key, Math.max(map.get(key) || 0, v));
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));
  }, [repsRecords]);

  const e1rmRecords = useMemo(() => repsRecords
    .filter((r) => typeof r.weight === 'number' && (r.weight as number) > 0)
    .map((r) => ({
      date: r.date,
      e1rm: computeE1rm(r.weight as number, r.repsAmount as number),
    })), [repsRecords]);

  const bestE1rm = useMemo(() => {
    let max = 0;
    e1rmRecords.forEach((r) => {
      if (r.e1rm > max) max = r.e1rm;
    });
    return max;
  }, [e1rmRecords]);

  const dailyMaxE1rmSeries = useMemo(() => {
    const map = new Map<string, number>();
    e1rmRecords.forEach((r) => {
      const key = dayKey(r.date);
      map.set(key, Math.max(map.get(key) || 0, r.e1rm));
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));
  }, [e1rmRecords]);

  return (
    <div className={styles.root}>
      <DateRange value={range} onChange={setRange} />

      {(isLoadingExercises || isLoadingRecords) ? (
        <div className={styles.loading}>
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {!exercises.length ? (
            <EmptyView title={t('home.noExercisesPrefix')}>
              <div>{t('home.noExercisesSuffix')}</div>
            </EmptyView>
          ) : !exerciseId ? null : !exerciseRecords.length ? (
            <EmptyView title={t('commonTexts.noDataForPeriod')} />
          ) : (
            <>
              <div className={styles.blockTitle}>
                {selectedExercise?.name || t('statistics.exerciseLabel')}
              </div>

              <div className={styles.highlights}>
                <Card className={styles.highlightCard}>
                  <div className={styles.highlightLabel}>{t('statistics.maxRepsSet')}</div>
                  <div className={styles.highlightValue}>{maxRepsSet || '-'}</div>
                </Card>
                <Card className={styles.highlightCard}>
                  <div className={styles.highlightLabel}>{t('statistics.maxRepsDay')}</div>
                  <div className={styles.highlightValue}>{maxRepsDay || '-'}</div>
                </Card>
                <Card className={styles.highlightCard}>
                  <div className={styles.highlightLabel}>{t('statistics.bestE1rm')}</div>
                  <div className={styles.highlightValue}>{bestE1rm ? bestE1rm.toFixed(1) : '-'}</div>
                </Card>
              </div>

              <div className={styles.blockTitle}>{t('statistics.chartMaxRepsPerDay')}</div>
              <div className={styles.chartBox}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyMaxRepsSeries}>
                    <CartesianGrid stroke="#eee" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => dayjs(d).format('DD/MM')}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(d) => dayjs(String(d)).format('DD/MM/YYYY')}
                    />
                    <Line type="monotone" dataKey="value" stroke="#ef6c00" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {!!dailyMaxE1rmSeries.length && (
                <>
                  <div className={styles.blockTitle}>{t('statistics.chartE1rmPerDay')}</div>
                  <div className={styles.chartBox}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dailyMaxE1rmSeries}>
                        <CartesianGrid stroke="#eee" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(d) => dayjs(d).format('DD/MM')}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(d) => dayjs(String(d)).format('DD/MM/YYYY')}
                          formatter={(v) => [Number(v).toFixed(1), 'e1RM']}
                        />
                        <Line type="monotone" dataKey="value" stroke="#2e7d32" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
