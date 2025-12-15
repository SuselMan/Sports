import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '@shared/Exercise.model';
import styles from './styles.module.css';
import Button from '@uikit/components/Button/Button';
import TrashIcon from '@uikit/icons/trash.svg?react';

export function ExerciseCard({
  exercise,
  onDelete,
  onOpen,
}: {
  exercise: Exercise;
  onDelete?: (id: string) => void;
  onOpen?: (exercise: Exercise) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.root} onClick={() => onOpen?.(exercise)} role="button">
      <div className={styles.row}>
        <div className={styles.info}>
          <h3 className={styles.title}>{exercise.name}</h3>
          <div className={styles.caption}>{t('commonTexts.type')}: {exercise.type}</div>
          <div className={styles.caption}>{t('commonTexts.muscles')}: {exercise.muscles.join(', ')}</div>
        </div>
        <div className={styles.actions}>
          <Button
            type="ghost"
            size="md"
            aria-label={t('exercises.delete')}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(exercise._id);
            }}
          >
            <TrashIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}


