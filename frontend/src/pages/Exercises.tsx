import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { api } from '../api/client';
import { ExerciseForm } from '../components/ExerciseForm';
import { ExerciseCard } from '../components/ExerciseCard';

type Exercise = { _id: string; name: string; type: 'REPS' | 'TIME'; muscles: string[] };

export default function Exercises() {
  const [list, setList] = useState<Exercise[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; type: 'REPS' | 'TIME'; muscles: string[] }>({
    name: '',
    type: 'REPS',
    muscles: [],
  });
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; type: 'REPS' | 'TIME'; muscles: string[] }>({
    name: '',
    type: 'REPS',
    muscles: [],
  });

  const load = async () => {
    const resp = await api.get('/exercises', { params: { page: 1, pageSize: 200, sortBy: 'name', sortOrder: 'asc' } });
    setList(resp.data.list);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    await api.post('/exercises', { name: form.name, type: form.type, muscles: form.muscles });
    setOpen(false);
    setForm({ name: '', type: 'REPS', muscles: [] });
    await load();
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
        <Typography variant="h6">Exercises</Typography>
        <Button sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }} variant="contained" onClick={() => setOpen(true)}>Add</Button>
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

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>Add Exercise</DialogTitle>
        <DialogContent>
          <ExerciseForm form={form} onChange={setForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!form.name.trim()}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Edit Exercise</DialogTitle>
        <DialogContent>
          <ExerciseForm form={editForm} onChange={setEditForm} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
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
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


