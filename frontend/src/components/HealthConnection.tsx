import React from 'react';
import { healthSettings, saveHealthSettings, sendHealthData, localBackup, importBackup } from '../offline/healthExport';

export default function HealthConnection() {
  const [settings, setSettings] = React.useState(healthSettings);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  React.useEffect(() => { const refresh = () => setSettings(healthSettings()); window.addEventListener('kektrack-sync-state', refresh); return () => window.removeEventListener('kektrack-sync-state', refresh); }, []);
  const update = (patch: Partial<typeof settings>) => { const next = { ...settings, ...patch }; setSettings(next); saveHealthSettings(next); };
  return <section style={{ margin: '24px 0', display: 'grid', gap: 12 }}>
    <h2>Подключение к «Здоровью»</h2>
    <p>Упражнения, подходы и показатели попадут в общую активность и будут доступны при подготовке рекомендаций. Записи остаются на устройстве.</p>
    <label><input type="checkbox" checked={settings.enabled} onChange={(e) => update({ enabled: e.target.checked })} /> Отправлять данные</label>
    <label>Адрес подключения<input style={{ width: '100%' }} type="url" placeholder="https://…/api/kektrack" value={settings.endpoint} onChange={(e) => update({ endpoint: e.target.value })} /></label>
    <label>Токен подключения<input style={{ width: '100%' }} type="password" autoComplete="off" value={settings.token} onChange={(e) => update({ token: e.target.value })} /></label>
    <p>Адрес и отдельный токен находятся на странице «Подключить Kektrack» в твоём проекте здоровья.</p>
    <button disabled={busy || !settings.enabled} onClick={async () => { setBusy(true); setMessage('Отправляю…'); try { await sendHealthData(true); setSettings(healthSettings()); setMessage('Данные получены проектом «Здоровье»'); } catch (e: any) { setMessage(e.message); } finally { setBusy(false); } }}>Отправить сейчас</button>
    <p role="status">{message || settings.error || (settings.lastSent ? `Последняя отправка: ${new Date(settings.lastSent).toLocaleString('ru')}` : 'Данные ещё не отправлялись')}</p>
    <small>Автоотправка работает, пока приложение открыто, и при возвращении в него. Без сети продолжай записывать: история отправится при следующем подключении. После выключения отправки уже полученные записи остаются в «Здоровье».</small>
    <h3>Перенос и резервная копия</h3>
    <button onClick={async () => { try { const text = JSON.stringify(await localBackup(), null, 2); if ((window as any).KektrackNative?.backup) { (window as any).KektrackNative.backup(text); } else { const url = URL.createObjectURL(new Blob([text], { type: 'application/json' })); const link = document.createElement('a'); link.href = url; link.download = 'kektrack-backup.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 10000); } } catch { setMessage('Не удалось создать копию'); } }}>Сохранить копию</button>
    <label>Восстановить из JSON<input type="file" accept="application/json,.json" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { await importBackup(await file.text()); setMessage('Копия восстановлена. Открой главную страницу для обновления.'); } catch (err: any) { setMessage(err.message); } }} /></label>
    <small>Копия содержит личные записи, без токена. История из браузера автоматически в APK не переносится: сохрани копию в веб-версии и восстанови здесь.</small>
  </section>;
}
