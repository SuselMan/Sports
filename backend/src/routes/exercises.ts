import { Router } from 'express';
import mongoose from 'mongoose';
import { ExerciseModel, ExerciseRecordModel } from '../models/Exercise';
import { AuthedRequest } from '../auth';
import { buildSort, getPagination } from '../utils/pagination';

export const exercisesRouter = Router();

// Create exercise
exercisesRouter.post('/', async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const { name, type, muscles } = req.body as { name: string; type: 'REPS' | 'TIME'; muscles: string[] };
    const created = await ExerciseModel.create({ userId, name, type, muscles });
    res.json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// List exercises
exercisesRouter.get('/', async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const { page, pageSize, sortBy, sortOrder } = getPagination(req);
  const q: any = { userId, archived: { $ne: true } };
  const total = await ExerciseModel.countDocuments(q);
  const list = await ExerciseModel.find(q)
    .sort(buildSort(sortBy!, sortOrder!) as any)
    .skip((page - 1) * pageSize)
    .limit(pageSize);
  res.json({ list, pagination: { total, page, pageSize } });
});

// Update exercise
exercisesRouter.put('/:exerciseId', async (req: AuthedRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { exerciseId } = req.params;
    const _id = new mongoose.Types.ObjectId(exerciseId);
    const { name, type, muscles } = req.body as { name?: string; type?: 'REPS' | 'TIME'; muscles?: string[] };
    const update: any = {};
    if (name != null) update.name = name;
    if (type != null) update.type = type;
    if (muscles != null) update.muscles = muscles;
    const updated = await ExerciseModel.findOneAndUpdate({ _id, userId }, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Exercise not found' });
    return res.json(updated);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

// Archive (soft-delete) exercise
exercisesRouter.delete('/:exerciseId', async (req: AuthedRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { exerciseId } = req.params;
    const _id = new mongoose.Types.ObjectId(exerciseId);
    const updated = await ExerciseModel.findOneAndUpdate(
      { _id, userId },
      { archived: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Exercise not found' });
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

// Delete a record
exercisesRouter.delete('/records/:recordId', async (req: AuthedRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { recordId } = req.params;
    const _id = new mongoose.Types.ObjectId(recordId);
    const result = await ExerciseRecordModel.deleteOne({ _id, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

// Update a record
exercisesRouter.put('/records/:recordId', async (req: AuthedRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { recordId } = req.params;
    const _id = new mongoose.Types.ObjectId(recordId);
    const {
      exerciseId,
      kind,
      repsAmount,
      durationMs,
      date,
      note,
      weight,
      rpe,
      restSec,
    } = req.body as any;
    const update: any = { kind, date, note, weight, rpe, restSec };
    if (exerciseId) update.exerciseId = new mongoose.Types.ObjectId(exerciseId);
    if (kind === 'REPS') {
      update.repsAmount = repsAmount;
      update.durationMs = undefined;
    } else if (kind === 'TIME') {
      update.durationMs = durationMs;
      update.repsAmount = undefined;
    }
    const result = await ExerciseRecordModel.findOneAndUpdate({ _id, userId }, update, { new: true });
    if (!result) return res.status(404).json({ error: 'Record not found' });
    return res.json(result);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

// Create record
exercisesRouter.post('/:exerciseId/records', async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const { exerciseId } = req.params;
    const { kind, repsAmount, durationMs, date, note, weight, rpe, restSec } = req.body as any;
    const created = await ExerciseRecordModel.create({
      userId,
      exerciseId,
      kind,
      repsAmount,
      durationMs,
      date,
      note,
      weight,
      rpe,
      restSec,
    });
    res.json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// List records with filters
exercisesRouter.get('/records', async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const { page, pageSize, sortBy, sortOrder } = getPagination(req);
  const { dateFrom, dateTo, timeFrom, timeTo, muscles, exerciseIds } = req.query as any;
  const q: any = { userId: userObjectId };
  if (exerciseIds) {
    const ids = String(exerciseIds)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((id) => new mongoose.Types.ObjectId(id));
    q.exerciseId = { $in: ids };
  }
  if (dateFrom || dateTo) {
    q.date = {};
    if (dateFrom) q.date.$gte = String(dateFrom);
    if (dateTo) q.date.$lte = String(dateTo);
  }
  // timeFrom/timeTo filter: substring of ISO time 'THH:MM:SS'
  if (timeFrom || timeTo) {
    // crude filter by regex on time component (UTC)
    if (timeFrom) q.date = { ...(q.date || {}), $regex: new RegExp(`T(${String(timeFrom)})`) };
  }
  // always join exercise to return Exercise in response and allow muscles filter
  const pipeline: any[] = [
    { $match: q },
    { $lookup: { from: 'exercises', localField: 'exerciseId', foreignField: '_id', as: 'exercise' } },
    { $unwind: '$exercise' },
  ];
  if (muscles) {
    const muscleList = String(muscles)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    pipeline.push({ $match: { 'exercise.muscles': { $in: muscleList } } });
  }
  const sortSpec = sortBy === 'name' ? { 'exercise.name': sortOrder === 'asc' ? 1 : -1 } : { date: sortOrder === 'asc' ? 1 : -1 };
  const totalAgg = await ExerciseRecordModel.aggregate([...pipeline, { $count: 'cnt' }]);
  const total = totalAgg[0]?.cnt || 0;
  const list = await ExerciseRecordModel.aggregate([
    ...pipeline,
    { $sort: sortSpec as any },
    { $skip: (page - 1) * pageSize },
    { $limit: pageSize },
    {
      $project: {
        _id: 1,
        kind: 1,
        exerciseId: 1,
        repsAmount: 1,
        durationMs: 1,
        date: 1,
        note: 1,
        weight: 1,
        rpe: 1,
        restSec: 1,
        exercise: {
          _id: '$exercise._id',
          userId: '$exercise.userId',
          name: '$exercise.name',
          type: '$exercise.type',
          muscles: '$exercise.muscles',
        },
      },
    },
  ]);
  res.json({ list, pagination: { total, page, pageSize } });
});


