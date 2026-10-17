import React from 'react';
import Button from '@uikit/components/Button/Button';
import { EXERCISE_IMPORT_LIMIT, parseExerciseImport, importExercises, type ImportedExercise } from '../offline/exerciseImport';

export default function ExerciseImport() {
  const [rows, setRows] = React.useState<ImportedExercise[] | null>(null);
  const [message, setMessage] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  return <section style={{ margin: '16px 0', display: 'grid', gap: 12 }} aria-label="Импорт упражнений">
    <h2>Импорт упражнений</h2>
    <p>Выбери JSON со списком упражнений. Существующие упражнения и история сохранятся; совпадающие названия будут пропущены.</p>
    <label>Файл упражнений JSON<input type="file" accept="application/json,.json" disabled={busy} onChange={async (e) => {
      const file = e.target.files?.[0]; e.target.value = ''; setRows(null); setMessage('');
      if (!file) return;
      setBusy(true);
      try {
        if (file.size > EXERCISE_IMPORT_LIMIT) throw Error('Файл больше 1 МБ');
        setRows(parseExerciseImport(await file.text()));
      } catch (err) { setMessage(err instanceof Error ? err.message : 'Не удалось прочитать файл'); }
      finally { setBusy(false); }
    }} /></label>
    {rows && <>
      <p>В файле: {rows.length}. Проверь список перед добавлением.</p>
      <ul style={{ maxHeight: 240, overflowY: 'auto', paddingLeft: 24 }}>{rows.map((row, i) => <li key={i}>{row.name} — {row.type === 'REPS' ? 'повторения' : 'время'}</li>)}</ul>
      <Button disabled={busy} onClick={async () => {
        setBusy(true);
        try { const result = await importExercises(rows); setMessage(`Добавлено: ${result.added}. Пропущено совпадений: ${result.skipped}.`); setRows(null); }
        catch { setMessage('Не удалось добавить упражнения. Попробуй ещё раз.'); }
        finally { setBusy(false); }
      }}>Добавить упражнения</Button>
      <Button disabled={busy} onClick={() => setRows(null)}>Отмена импорта</Button>
    </>}
    <p role="status">{message}</p>
  </section>;
}
