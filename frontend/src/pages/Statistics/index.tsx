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
import type { Exercise, ExerciseRecordResponse } from '@shared/Exercise.model';
import { useStatisticsDateRangeStore } from '../../store/filters';
import { DateRange } from '../../components/DateRange';
import { useDbReload } from '../../offline/hooks';
import { getExerciseRecordsLocal, getExercisesLocal } from '../../offline/repo';
import styles from './styles.module.css';

function computeE1rm(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

function dayKey(iso: string): string {
  return dayjs(iso).format('YYYY-MM-DD');
}

export default function Statistics() {
  const range = useStatisticsDateRangeStore((s) => s.range);
  const setRange = useStatisticsDateRangeStore((s) => s.setRange);
  const navigate = useNavigate();
  const params = useParams();
  const exerciseId = (params.exerciseId || '').trim();
  const { t } = useTranslation();

  const exercisesLoader = React.useCallback(() => getExercisesLocal(), []);
  const { data: allExercises, loading: isLoadingExercises } = useDbReload<Exercise[]>(exercisesLoader, []);
  const exercises = useMemo(() => allExercises.filter((e) => !e.archived), [allExercises]);

  const recordsLoader = React.useCallback(() => getExerciseRecordsLocal(), []);
  const { data: allRecords, loading: isLoadingRecords } = useDbReload<ExerciseRecordResponse[]>(recordsLoader, []);

  useEffect(() => {
    if (!exerciseId && exercises.length) {
      navigate(`/statistics/${exercises[0]._id}`, { replace: true });
    }
  }, [exerciseId, exercises, navigate]);

  const selectedExercise = useMemo(
    () => exercises.find((x) => x._id === exerciseId) ?? null,
    [exercises, exerciseId],
  );

  const exerciseRecordsAllTime = useMemo(
    () => allRecords.filter((r) => !r.archived && r.exerciseId === exerciseId),
    [allRecords, exerciseId],
  );

  const exerciseRecords = useMemo(
    () => exerciseRecordsAllTime.filter((r) => r.date >= range.from && r.date <= range.to),
    [exerciseRecordsAllTime, range],
  );

  const repsRecords = useMemo(
    () => exerciseRecords.filter((r) => r.kind === 'REPS' && typeof r.repsAmount === 'number'),
    [exerciseRecords],
  );

  const repsRecordsAllTime = useMemo(
    () => exerciseRecordsAllTime.filter((r) => r.kind === 'REPS' && typeof r.repsAmount === 'number'),
    [exerciseRecordsAllTime],
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
    const map = new Map<string, number>();
    repsRecordsAllTime.forEach((r) => {
      const key = dayKey(r.date);
      map.set(key, (map.get(key) || 0) + (r.repsAmount as number));
    });
    let max = 0;
    map.forEach((v) => {
      if (v > max) max = v;
    });
    return max;
  }, [repsRecordsAllTime]);

  // reps per day (total reps for the day)
  const repsPerDaySeries = useMemo(() => Array.from(repsPerDayTotal.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value })), [repsPerDayTotal]);

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
                  <LineChart data={repsPerDaySeries}>
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
