import { getDb } from './db';
import { withCalendarDate } from './calendarDate';

type Settings = { enabled: boolean; endpoint: string; token: string; lastSent?: string; lastDigest?: string; error?: string };
const KEY = 'kektrack_health_sync';
export function healthSettings(): Settings {
  try { return { enabled: false, endpoint: '', token: '', ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
  catch { return { enabled: false, endpoint: '', token: '' }; }
}
export function saveHealthSettings(settings: Settings) { localStorage.setItem(KEY, JSON.stringify(settings)); window.dispatchEvent(new Event('kektrack-sync-state')); }
let running: Promise<void> | null = null;
export function sendHealthData(force = false): Promise<void> {
  if (running) return running;
  running = (async () => {
    const settings = healthSettings();
    if (!settings.enabled) return;
    const endpoint = new URL(settings.endpoint);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || !endpoint.pathname.endsWith('/api/kektrack')) throw Error('Нужен HTTPS-адрес /api/kektrack со страницы подключения');
    if (!settings.token.trim()) throw Error('Укажи токен подключения');
    const db = await getDb();
    const tx = db.transaction(['exercises', 'exerciseRecords', 'metrics', 'metricRecords'], 'readonly');
    const [exercises, exerciseRecords, metrics, metricRecords] = await Promise.all([
      tx.objectStore('exercises').getAll(), tx.objectStore('exerciseRecords').getAll(),
      tx.objectStore('metrics').getAll(), tx.objectStore('metricRecords').getAll(),
    ]);
    await tx.done;
    const content = { schema: 'kektrack-v1', exercises, exerciseRecords: exerciseRecords.map(withCalendarDate), metrics, metricRecords: metricRecords.map(withCalendarDate) };
    const digestBytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify([settings.endpoint, settings.token, content])));
    const digest = Array.from(new Uint8Array(digestBytes)).map((v) => v.toString(16).padStart(2, '0')).join('');
    if (!force && settings.lastDigest === digest) return;
    const body = JSON.stringify({ ...content, exportedAt: new Date().toISOString() });
    try {
      const native = (window as any).KektrackNative;
      if (!native) throw Error('Отправка доступна в Android-приложении Kektrack');
      await new Promise<void>((resolve, reject) => {
        const id = crypto.randomUUID();
        const timer = setTimeout(() => { delete (window as any).__kektrackReply; reject(Error('Сервер не ответил. Попробуй позже.')); }, 45000);
        (window as any).__kektrackReply = (replyId: string, ok: boolean, message: string) => {
          if (replyId !== id) return;
          clearTimeout(timer); delete (window as any).__kektrackReply;
          if (ok) resolve(); else reject(Error(message));
        };
        native.send(id, endpoint.href, settings.token.trim(), body);
      });
      saveHealthSettings({ ...healthSettings(), lastSent: new Date().toISOString(), lastDigest: digest, error: '' });
    } catch (e: any) { saveHealthSettings({ ...healthSettings(), error: e.message }); throw e; }
  })().finally(() => { running = null; });
  return running;
}
let timer: ReturnType<typeof setTimeout> | undefined;
export function scheduleHealthExport() {
  clearTimeout(timer);
  if (!healthSettings().enabled) return;
  timer = setTimeout(() => { sendHealthData().catch(() => {}); }, 1500);
}
export function installHealthExport() {
  window.addEventListener('online', scheduleHealthExport);
  window.addEventListener('focus', scheduleHealthExport);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) scheduleHealthExport(); });
  scheduleHealthExport();
  setInterval(scheduleHealthExport, 60000);
}

export async function localBackup() {
  const db = await getDb();
  const tx = db.transaction(['exercises', 'exerciseRecords', 'metrics', 'metricRecords'], 'readonly');
  const result: any = { schema: 'kektrack-v1', exportedAt: new Date().toISOString() };
  await Promise.all(['exercises', 'exerciseRecords', 'metrics', 'metricRecords'].map(async (table) => { result[table] = await tx.objectStore(table as any).getAll(); }));
  await tx.done;
  result.exerciseRecords = result.exerciseRecords.map(withCalendarDate);
  result.metricRecords = result.metricRecords.map(withCalendarDate);
  return result;
}
export async function importBackup(text: string) {
  const data = JSON.parse(text);
  if (data.schema !== 'kektrack-v1') throw Error('Неизвестный формат резервной копии');
  const tables = ['exercises', 'exerciseRecords', 'metrics', 'metricRecords'] as const;
  for (const table of tables) {
    if (!Array.isArray(data[table])) throw Error('Неполная резервная копия');
    for (const row of data[table]) {
      if (!row || typeof row._id !== 'string' || typeof row.updatedAt !== 'string' || !Number.isFinite(Date.parse(row.updatedAt))) throw Error('Некорректная запись');
    }
  }
  const db = await getDb();
  const tx = db.transaction([...tables], 'readwrite');
  for (const table of tables) {
    for (const row of data[table]) {
      const old: any = await tx.objectStore(table).get(row._id);
      if (!old || Date.parse(old.updatedAt) <= Date.parse(row.updatedAt)) await tx.objectStore(table).put(row);
    }
  }
  await tx.done;
  scheduleHealthExport();
}
