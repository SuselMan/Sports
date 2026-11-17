import React, { useEffect, useMemo, useId } from 'react';
import { useParams } from 'react-router-dom';
import { ComposedChart, Area, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import Spinner from '@uikit/components/Spinner/Spinner';
import EmptyView from '@uikit/components/EmptyView/EmptyView';
import Card from '@uikit/components/Card/Card';
import type { Exercise, ExerciseRecordResponse } from '@shared/Exercise.model';
import { useStatisticsDateRangeStore } from '../../store/filters';
import { DateRange } from '../../components/DateRange';
import { PeriodChips } from '../../components/PeriodChips';
import { useDbReload } from '../../offline/hooks';
import { getExerciseRecordsLocal, getExercisesLocal } from '../../offline/repo';
import { storage } from '../../utils/storage';
import { buildStatistics, METRICS, type MetricKey, type MetricData } from './data';
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


function StatChart({ metric, label, unit, color, grid }: {metric: MetricData;label:string;unit:string;color:string;grid:string}) {
  const id = useId().replace(/:/g,'');
  return <div className={styles.chartBox} aria-label={`${label}, ${unit}`}>
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={metric.points} margin={{right:12}}>
        <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.15}/><stop offset="100%" stopColor={color} stopOpacity={0}/></linearGradient></defs>
        <CartesianGrid stroke={grid}/>
        <XAxis dataKey="date" tickFormatter={d=>dayjs(d).format('DD/MM')}/>
        <YAxis width={45} allowDecimals={metric.key==='e1rm'||metric.key==='weight'}/>
        <Tooltip labelFormatter={d=>dayjs(String(d)).format('DD/MM/YYYY')} formatter={v=>[`${Number(v).toLocaleString(undefined,{maximumFractionDigits:1})} ${unit}`,label]}/>
        <Area name={label} type="linear" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#${id})`} dot={{r:3}}/>
        {metric.points.length>1&&<Line type="linear" dataKey="trend" stroke={color} strokeDasharray="6 3" strokeOpacity={0.5} dot={false} activeDot={false} tooltipType="none"/>}
      </ComposedChart>
    </ResponsiveContainer>
  </div>;
}

export default function Statistics() {
  const range=useStatisticsDateRangeStore(s=>s.range), setRange=useStatisticsDateRangeStore(s=>s.setRange);
  const {exerciseId=''}=useParams();const {t}=useTranslation();
  const color=useCssVar('--main-active-color','#ef6c00'),grid=useCssVar('--chart-grid-color','rgba(0,0,0,0.1)');
  const [selected,setSelected]=React.useState<MetricKey[]>(()=>{
    const saved=storage.get<unknown>('statisticsMetrics',METRICS);
    return Array.isArray(saved)?saved.filter((k):k is MetricKey=>METRICS.includes(k as MetricKey)):[...METRICS];
  });
  const exerciseLoader=React.useCallback(()=>getExercisesLocal(),[]),recordLoader=React.useCallback(()=>getExerciseRecordsLocal(),[]);
  const {data:exercises,loading:loadingExercises}=useDbReload<Exercise[]>(exerciseLoader,[]);
  const {data:records,loading:loadingRecords}=useDbReload<ExerciseRecordResponse[]>(recordLoader,[]);
  const groups=useMemo(()=>buildStatistics(exercises,records,range.from,range.to,exerciseId),[exercises,records,range,exerciseId]);
  const labels:Record<MetricKey,string>={maxReps:t('statistics.maxRepsSet'),dailyReps:t('statistics.maxRepsDay'),e1rm:t('statistics.bestE1rm'),weight:t('statistics.bestWeight'),duration:t('statistics.duration')};
  const unit=(key:MetricKey)=>key==='weight'||key==='e1rm'?'кг':key==='duration'?'сек.':'повт.';
  const toggle=(key:MetricKey)=>setSelected(previous=>{const next=previous.includes(key)?previous.filter(k=>k!==key):[...previous,key];storage.set('statisticsMetrics',next);return next;});
  const visible=groups.map(g=>({...g,metrics:g.metrics.filter(m=>selected.includes(m.key))})).filter(g=>g.metrics.length);
  return <div className={styles.root}>
    <h1 className={styles.pageTitle}>{t('nav.statistics')}</h1>
    <DateRange value={range} onChange={setRange}/>
    <PeriodChips range={range} onChange={setRange} records={records}/>
    <div className={styles.metricChips} role="group" aria-label="Показатели статистики">
      {METRICS.map(key=><button key={key} type="button" aria-pressed={selected.includes(key)} className={`${styles.metricChip} ${selected.includes(key)?styles.metricChipActive:''}`} onClick={()=>toggle(key)}>{labels[key]}</button>)}
    </div>
    {(loadingExercises||loadingRecords)?<div className={styles.loading}><Spinner size="lg"/></div>:!selected.length?<p>Выбери хотя бы один показатель.</p>:!visible.length?<EmptyView title={t('commonTexts.noDataForPeriod')}/>:visible.map(group=><section key={group.exercise._id} className={styles.exerciseSection} aria-label={group.exercise.name}>
      <h2 className={styles.blockTitle}>{group.exercise.name}</h2>
      <div className={styles.highlights}>{group.metrics.map(metric=><Card key={metric.key} className={styles.highlightCard}>
        <div className={styles.highlightLabel}>{labels[metric.key]}</div><div className={styles.highlightValue}>{metric.best.toLocaleString(undefined,{maximumFractionDigits:metric.key==='e1rm'?1:2})} <small>{unit(metric.key)}</small></div>
      </Card>)}</div>
      {group.metrics.map(metric=><div key={metric.key}><h3 className={styles.chartTitle}>{metric.key==='dailyReps'?'Сумма повторений за день':labels[metric.key]}</h3><StatChart metric={metric} label={labels[metric.key]} unit={unit(metric.key)} color={color} grid={grid}/></div>)}
    </section>)}
  </div>;
}
