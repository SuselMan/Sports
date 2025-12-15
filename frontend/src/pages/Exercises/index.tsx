import React, { useEffect, useState } from 'react';
import Button from '@uikit/components/Button/Button';
import Modal from '@uikit/components/Modal/Modal';
import { api } from '../../api/client';
import { ExerciseForm } from '../../components/ExerciseForm';
import { ExerciseCard } from '../../components/ExerciseCard';
import { AddFab } from '../../components/AddFab';
import { useModalBackClose } from '../../hooks/useModalBackClose';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Exercise, ExerciseType } from "@shared/Exercise.model";
import type { Muscles } from "@shared/Shared.model";
import styles from './styles.module.css';

export default function Exercises() {
  const [list, setList] = useState<Exercise[]>([]);
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

  const load = async () => {
    const resp = await api.get('/exercises', { params: { page: 1, pageSize: 200, sortBy: 'name', sortOrder: 'asc' } });
    setList(resp.data.list);
  };

  useEffect(() => {
    load();
  }, []);

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
    await api.post('/exercises', { name: form.name, type: form.type, muscles: form.muscles });
    closeCreateDialog();
    setForm({ name: '', type: 'REPS', muscles: [] });
    await load();
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
        {list.map((e) => (
          <ExerciseCard
            key={e._id}
            exercise={e}
            onDelete={async (id) => {
              await api.delete(`/exercises/${id}`);
              setList((prev) => prev.filter((x) => x._id !== id));
            }}
            onOpen={(ex) => {
              setEditId(ex._id);
              setEditForm({ name: ex.name, type: ex.type, muscles: ex.muscles });
              setEditOpen(true);
            }}
          />
        ))}
        {!list.length && <div className={styles.empty}>No data for chosen period.</div>}
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
                  const updated = await api.put(`/exercises/${editId}`, {
                    name: editForm.name,
                    type: editForm.type,
                    muscles: editForm.muscles,
                  });
                  setEditOpen(false);
                  setList((prev) => prev.map((x) => (x._id === editId ? updated.data : x)));
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


