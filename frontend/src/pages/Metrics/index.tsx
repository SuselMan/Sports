import React, { useMemo, useState } from 'react';
import Button from '@uikit/components/Button/Button';
import Modal from '@uikit/components/Modal/Modal';
import { useTranslation } from 'react-i18next';
import Spinner from '@uikit/components/Spinner/Spinner';
import EmptyView from '@uikit/components/EmptyView/EmptyView';
import type { Metric, Unit } from '@shared/Metrics.model';
import type { Muscles } from '@shared/Shared.model';
import { AddFab } from '../../components/AddFab';
import { useModalBackClose } from '../../hooks/useModalBackClose';
import { MetricForm } from '../../components/MetricForm';
import { MetricCard } from '../../components/MetricCard';
import { useDbReload } from '../../offline/hooks';
import { getMetricsLocal } from '../../offline/repo';
import { archiveMetricLocal, upsertMetricLocal } from '../../offline/mutations';
import styles from './styles.module.css';

export default function Metrics() {
  const loader = React.useCallback(() => getMetricsLocal(), []);
  const { data: all, loading: isLoading } = useDbReload<Metric[]>(loader, []);
  const list = useMemo(() => all.filter((x) => !x.archived), [all]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; unit: Unit; muscles: Muscles[] }>({ name: '', unit: 'count', muscles: [] });
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; unit: Unit; muscles: Muscles[] }>({ name: '', unit: 'count', muscles: [] });
  const { t } = useTranslation();

  const closeCreateDialog = () => {
    setOpen(false);
  };

  const submit = async () => {
    await upsertMetricLocal({ name: form.name, unit: form.unit, muscles: form.muscles });
    closeCreateDialog();
    setForm({ name: '', unit: 'count', muscles: [] });
  };

  // Close dialogs on mobile back button
  useModalBackClose(open, () => setOpen(false));
  useModalBackClose(editOpen, () => setEditOpen(false));

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <div className={styles.title}>{t('metrics.title')}</div>
      </div>

      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.loading}>
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {list.map((m) => (
              <MetricCard
                key={m._id}
                metric={m}
                onDelete={async (id) => {
                  await archiveMetricLocal(id);
                }}
                onOpen={(metric) => {
                  setEditId(metric._id);
                  setEditForm({ name: metric.name, unit: metric.unit, muscles: metric.muscles || [] });
                  setEditOpen(true);
                }}
              />
            ))}
            {!list.length && (
              <EmptyView title={t('commonTexts.noDataForPeriod')}>
                <div className={styles.emptyActions}>
                  <Button type="active" size="md" onClick={() => setOpen(true)}>
                    {t('metrics.addTitle')}
                  </Button>
                </div>
              </EmptyView>
            )}
          </>
        )}
      </div>

      {open && (
        <Modal title={t('metrics.addTitle')} close={closeCreateDialog}>
          <div className={styles.modalCol}>
            <MetricForm form={form} onChange={setForm} />
            <div className={styles.modalActions}>
              <Button onClick={closeCreateDialog}>{t('actions.cancel')}</Button>
              <Button onClick={submit} disabled={!form.name.trim()}>{t('actions.save')}</Button>
            </div>
          </div>
        </Modal>
      )}

      {editOpen && (
        <Modal title={t('metrics.editTitle')} close={() => setEditOpen(false)}>
          <div className={styles.modalCol}>
            <MetricForm form={editForm} onChange={setEditForm} />
            <div className={styles.modalActions}>
              <Button
                onClick={async () => {
                  if (!editId) return;
                  await upsertMetricLocal({
                    _id: editId,
                    name: editForm.name,
                    unit: editForm.unit,
                    muscles: editForm.muscles,
                  });
                  setEditOpen(false);
                }}
                disabled={!editForm.name.trim()}
              >
                {t('actions.save')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <AddFab onClick={() => setOpen(true)} />
    </div>
  );
}


