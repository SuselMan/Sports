import dayjs from 'dayjs';
import type { Exercise, ExerciseRecordResponse } from '@shared/Exercise.model';

export const METRICS = ['maxReps', 'dailyReps', 'e1rm', 'weight', 'duration'] as const;
export type MetricKey = typeof METRICS[number];
export type Point = { date: string; value: number; trend: number };
export type MetricData = { key: MetricKey; best: number; points: Point[] };
export const recordDay = (r: ExerciseRecordResponse) => r.calendarDate || dayjs(r.date).format('YYYY-MM-DD');

export function addTrendLine(data: { date: string; value: number }[]): Point[] {
  if (data.length < 2) return data.map(d => ({ ...d, trend: d.value }));
  // Use elapsed calendar days so gaps between workouts have their real length.
  const start = dayjs(data[0].date);
  const xs = data.map(d => dayjs(d.date).diff(start, 'day'));
  const n = data.length, sx = xs.reduce((a,b) => a+b, 0), sy = data.reduce((a,d) => a+d.value, 0);
  const sxy = data.reduce((a,d,i) => a+xs[i]*d.value, 0), sxx = xs.reduce((a,x) => a+x*x, 0);
  const slope = (n*sxy-sx*sy)/(n*sxx-sx*sx || 1), intercept = (sy-slope*sx)/n;
  return data.map((d,i) => ({ ...d, trend: Math.round((intercept+slope*xs[i])*100)/100 }));
}

export function buildStatistics(exercises: Exercise[], records: ExerciseRecordResponse[], from: string, to: string, exerciseId = '') {
  const start = dayjs(from).format('YYYY-MM-DD'), end = dayjs(to).format('YYYY-MM-DD');
  const grouped = new Map<string, ExerciseRecordResponse[]>();
  for (const r of records) {
    if (r.archived || (exerciseId && r.exerciseId !== exerciseId)) continue;
    const day = recordDay(r);
    if (day < start || day > end) continue;
    const list = grouped.get(r.exerciseId) || []; list.push(r); grouped.set(r.exerciseId,list);
  }
  return exercises.filter(e => !e.archived && grouped.has(e._id)).sort((a,b) => a.name.localeCompare(b.name)).map(exercise => {
    const sets = grouped.get(exercise._id)!;
    const days = new Map<MetricKey, Map<string,number>>(METRICS.map(k => [k,new Map()]));
    const collect = (key: MetricKey, day: string, value: number, sum = false) => {
      if (!Number.isFinite(value) || value < 0) return;
      const map = days.get(key)!; map.set(day, sum ? (map.get(day)||0)+value : Math.max(map.get(day)||0,value));
    };
    for (const r of sets) {
      const day = recordDay(r);
      if (r.kind === 'REPS' && typeof r.repsAmount === 'number') {
        collect('maxReps',day,r.repsAmount);collect('dailyReps',day,r.repsAmount,true);
        if (typeof r.weight === 'number' && r.weight > 0 && r.repsAmount > 0) collect('e1rm',day,r.weight*(1+r.repsAmount/30));
      }
      if (typeof r.weight === 'number' && r.weight > 0) collect('weight',day,r.weight);
      if (r.kind === 'TIME' && typeof r.durationMs === 'number') collect('duration',day,r.durationMs/1000,true);
    }
    const metrics: MetricData[] = METRICS.flatMap(key => {
      const values = days.get(key)!;
      if (!values.size) return [];
      const points = addTrendLine([...values].sort(([a],[b]) => a.localeCompare(b)).map(([date,value]) => ({date,value})));
      return [{key,best:Math.max(...points.map(p=>p.value)),points}];
    });
    return {exercise,sets:sets.length,metrics};
  });
}
