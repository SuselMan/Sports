import React from 'react';
import Button from '@uikit/components/Button/Button';
import Notification from '@uikit/components/Notification/Notification';
import { EXERCISE_IMPORT_LIMIT, parseExerciseImport, importExercises } from '../offline/exerciseImport';

export default function ExerciseImport() {
  const fileInput = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = React.useState('');
  const [failed, setFailed] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  return (
    <section aria-label="Импорт упражнений">
      <Button size="md" disabled={busy} onClick={() => fileInput.current?.click()}>Import JSON</Button>
      <input
        ref={fileInput}
        type="file"
        hidden
        aria-label="Файл упражнений JSON"
        accept="application/json,.json"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (!file) return;
          setMessage('');
          setFailed(false);
          setBusy(true);
          try {
            if (file.size > EXERCISE_IMPORT_LIMIT) throw Error('Файл больше 1 МБ');
            const result = await importExercises(parseExerciseImport(await file.text()));
            setMessage(`Добавлено: ${result.added}. Пропущено совпадений: ${result.skipped}.`);
          } catch (err) {
            setFailed(true);
            setMessage(err instanceof Error ? err.message : 'Не удалось добавить упражнения');
          } finally {
            setBusy(false);
          }
        }}
      />
      {message && (
        <div role="status">
          <Notification size="sm" type={failed ? 'error' : 'success'}>{message}</Notification>
        </div>
      )}
    </section>
  );
}
