import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { api } from '../api/client';
import { ExerciseForm } from '../components/ExerciseForm';
import { ExerciseCard } from '../components/ExerciseCard';
import { AddFab } from '../components/AddFab';
import { useModalBackClose } from '../hooks/useModalBackClose';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Exercise, ExerciseType } from "@shared/Exercise.model";
import type { Muscles } from "@shared/Shared.model";

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
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
        <Typography variant="h6">{t('exercises.title')}</Typography>
      </Stack>

      <Stack spacing={1}>
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
        {!list.length && <Typography variant="body2" color="text.secondary">No data for chosen period.</Typography>}
      </Stack>

      <Dialog open={open} onClose={closeCreateDialog} fullWidth>
        <DialogTitle>{t('exercises.addTitle')}</DialogTitle>
        <DialogContent>
          <ExerciseForm form={form} onChange={setForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCreateDialog}>{t('actions.cancel')}</Button>
          <Button variant="contained" onClick={submit} disabled={!form.name.trim()}>{t('actions.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>{t('exercises.editTitle')}</DialogTitle>
        <DialogContent>
          <ExerciseForm form={editForm} onChange={setEditForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>{t('actions.cancel')}</Button>
          <Button
            variant="contained"
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
        </DialogActions>
      </Dialog>

      <AddFab onClick={() => setOpen(true)} />
    </Box>
  );
}


