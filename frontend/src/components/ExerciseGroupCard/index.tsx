import React from 'react';
import { ExerciseRecordCard } from '../ExerciseRecordCard';
import type { Exercise, ExerciseRecordResponse } from '@shared/Exercise.model';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';
import Button from '@uikit/components/Button/Button';
import ChevronDownIcon from '@uikit/icons/chevron-down.svg?react';

export function ExerciseGroupCard({
  exercise,
  records,
  onDeleted,
  onRepeated,
  onOpen,
}: {
  exercise?: Exercise;
  records: ExerciseRecordResponse[];
  onDeleted?: (id: string) => void;
  onRepeated?: (rec: ExerciseRecordResponse) => void;
  onOpen?: (rec: ExerciseRecordResponse) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t } = useTranslation();

  const isReps = records[0]?.kind === 'REPS';
  const summary = React.useMemo(() => {
    const tooMany = records.length > 5;
    if (isReps) {
      const parts = records
        .map((r) => (typeof r.repsAmount === 'number' ? r.repsAmount : 0))
        .filter((v) => typeof v === 'number');
      const total = parts.reduce((a, b) => a + b, 0);
      if (tooMany) {
        return total;
      }
      return `${parts.join('+')} (${total})`;
    } else {
      const minutes = records
        .map((r) => (typeof r.durationMs === 'number' ? Math.round((r.durationMs as number) / 60000) : 0))
        .filter((v) => typeof v === 'number');
      const totalMin = minutes.reduce((a, b) => a + b, 0);
      const totalHours = Math.floor(totalMin / 60);
      const remMin = totalMin % 60;
      const totalStr =
        totalHours > 0
          ? `${totalHours}${t('group.h')} ${remMin > 0 ? `${remMin}${t('group.min')} ` : ''}${t('group.total')}`
          : `${totalMin}${t('group.min')} ${t('group.total')}`;
      if (tooMany) {
        return totalStr;
      }
      return `${minutes.map((m) => `${m}${t('group.min')}`).join(' + ')} (${totalStr})`;
    }
  }, [isReps, records, t]);

  return (
    <div className={styles.root}>
      <div className={styles.header} onClick={() => setIsOpen((v) => !v)} role="button">
        <div className={styles.info}>
            <h3 className={styles.title}>{exercise?.name} <span className={styles.summary}>{summary}</span></h3>
          {!!exercise?.muscles?.length && (
            <div className={styles.muscles}>
              {exercise.muscles.join(', ')}
            </div>
          )}
        </div>
        <Button type="ghost" size="sm" aria-label="toggle" className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
          <ChevronDownIcon />
        </Button>
      </div>
      {isOpen && (
        <div className={styles.children}>
          {records.map((r) => (
            <ExerciseRecordCard key={r._id} record={r} onDeleted={onDeleted} onRepeated={onRepeated} onOpen={onOpen} showMuscles={false} showName={false} />
          ))}
        </div>
      )}
    </div>
  );
}


