import React, { useEffect, useMemo, useState } from 'react';
import Button from '@uikit/components/Button/Button';
import Modal from '@uikit/components/Modal/Modal';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from '@uikit/components/Spinner/Spinner';
import EmptyView from '@uikit/components/EmptyView/EmptyView';
import { Exercise, ExerciseType } from '@shared/Exercise.model';
import type { Muscles } from '@shared/Shared.model';
import { ExerciseForm } from '../../components/ExerciseForm';
import { ExerciseCard } from '../../components/ExerciseCard';
import { AddFab } from '../../components/AddFab';
import { useModalBackClose } from '../../hooks/useModalBackClose';
import { useDbReload } from '../../offline/hooks';
import { getExercisesLocal } from '../../offline/repo';
import { archiveExerciseLocal, upsertExerciseLocal } from '../../offline/mutations';
import styles from './styles.module.css';

export default function Exercises() {
  const loader = React.useCallback(() => getExercisesLocal(), []);
  const { data: all, loading: isLoading } = useDbReload<Exercise[]>(loader, []);
  const list = useMemo(() => all.filter((x) => !x.archived), [all]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; type: ExerciseType; muscles: Muscles[] }>({
    name: '',
    type: 'REPS',
    muscles: [],
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; type: ExerciseType; muscles: Muscles[] }>({
    name: '',
    type: 'REPS',
    muscles: [],
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  // Auto-open create dialog if ?createNew=true is present
  useEffect(() => {
    if (searchParams.get('createNew') === 'true') {
      setOpen(true);
    }
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeCreateDialog = () => {
    setOpen(false);
    if (searchParams.get('createNew') === 'true') {
      const params = new URLSearchParams(searchParams);
      params.delete('createNew');
      setSearchParams(params, { replace: true });
    }
  };

  const submit = async () => {
    await upsertExerciseLocal({ name: form.name, type: form.type, muscles: form.muscles });
    closeCreateDialog();
    setForm({ name: '', type: 'REPS', muscles: [] });
  };

  // Close dialogs on mobile back button
  useModalBackClose(open, () => setOpen(false));
  useModalBackClose(editOpen, () => setEditOpen(false));

  return (
    <div className={styles.root}>
      <div className={styles.headerRow}>
        <div className={styles.title}>{t('exercises.title')}</div>
      </div>

      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.loading}>
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {list.map((e) => (
              <ExerciseCard
                key={e._id}
                exercise={e}
                onDelete={async (id) => {
                  await archiveExerciseLocal(id);
                }}
                onOpen={(ex) => {
                  setEditId(ex._id);
                  setEditForm({ name: ex.name, type: ex.type, muscles: ex.muscles });
                  setEditOpen(true);
                }}
              />
            ))}
            {!list.length && (
              <EmptyView title={t('commonTexts.noDataForPeriod')}>
                <div className={styles.emptyActions}>
                  <Button type="active" size="md" onClick={() => setOpen(true)}>
                    {t('exercises.addTitle')}
                  </Button>
                </div>
              </EmptyView>
            )}
          </>
        )}
      </div>

      {open && (
        <Modal title={t('exercises.addTitle')} close={closeCreateDialog}>
          <div className={styles.modalCol}>
            <ExerciseForm form={form} onChange={setForm} />
            <div className={styles.modalActions}>
              <Button onClick={closeCreateDialog}>{t('actions.cancel')}</Button>
              <Button onClick={submit} disabled={!form.name.trim()}>{t('actions.save')}</Button>
            </div>
          </div>
        </Modal>
      )}

      {editOpen && (
        <Modal title={t('exercises.editTitle')} close={() => setEditOpen(false)}>
          <div className={styles.modalCol}>
            <ExerciseForm form={editForm} onChange={setEditForm} />
            <div className={styles.modalActions}>
              <Button
                onClick={async () => {
                  if (!editId) return;
                  await upsertExerciseLocal({
                    _id: editId,
                    name: editForm.name,
                    type: editForm.type,
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
