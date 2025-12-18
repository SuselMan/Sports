import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import type { MetricRecordResponse } from '@shared/Metrics.model';
import Button from '@uikit/components/Button/Button';
import TrashIcon from '@uikit/icons/trash.svg?react';
import styles from './styles.module.css';
import { api } from '../../api/client';

export function MetricRecordCard({
  record,
  onDeleted,
  onOpen,
}: {
  record: MetricRecordResponse;
  onDeleted?: (id: string) => void;
  onOpen?: (rec: MetricRecordResponse) => void;
}) {
  const { t } = useTranslation();
  const onCardKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!onOpen) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(record);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await api.delete(`/metrics/records/${record._id}`);
    onDeleted?.(record._id);
  };

  const title = record.metric?.name || t('metricRecords.fallbackMetricName');
  const valueText = `${record.value}${record.metric?.unit ? ` ${record.metric.unit}` : ''}`;

  const inner = (
    <>
      <Button
        type="ghost"
        size="md"
        aria-label="delete"
        className={styles.iconDelete}
        onClick={handleDelete}
      >
        <TrashIcon />
      </Button>
      <h3 className={styles.title}>
        {title}
        <span className={styles.value}>
          {' '}
          {valueText}
        </span>
      </h3>
      <div className={styles.caption}>
        {dayjs(record.date).format('DD/MM/YYYY')}
      </div>
    </>
  );

  if (onOpen) {
    return (
      <div
        className={`${styles.root} ${styles.relative} ${styles.clickable}`}
        onClick={() => onOpen(record)}
        onKeyDown={onCardKeyDown}
        role="button"
        tabIndex={0}
      >
        {inner}
      </div>
    );
  }

  return (
    <div className={`${styles.root} ${styles.relative}`}>
      {inner}
    </div>
  );
}


