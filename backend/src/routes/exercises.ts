import { Router } from 'express';
import mongoose from 'mongoose';
import type { ExerciseCreateRequest, ExerciseRecordCreateRequest, ExerciseType } from '../../../shared/Exercise.model';
import type { Muscles } from '../../../shared/Shared.model';
import { ExerciseModel, ExerciseRecordModel } from '../models/Exercise';
import { AuthedRequest } from '../auth';
import { buildSort, getPagination } from '../utils/pagination';

export const exercisesRouter = Router();

// Create exercise
exercisesRouter.post('/', async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const { _id, name, type, muscles } = req.body as ExerciseCreateRequest;
    const created = await ExerciseModel.create({
      ...(typeof _id === 'string' ? { _id: new mongoose.Types.ObjectId(_id) } : {}),
      userId, name, type, muscles,
    });
    res.json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// List exercises
exercisesRouter.get('/', async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const {
    page, pageSize, sortBy, sortOrder,
  } = getPagination(req);
  const includeArchived = String((req.query as any).archived || 'false') === 'true';
  const q: any = includeArchived ? { userId } : { userId, archived: { $ne: true } };
  const updatedAfterRaw = (req.query as any).updatedAfter;
  if (updatedAfterRaw) {
    const d = new Date(String(updatedAfterRaw));
    if (Number.isNaN(d.valueOf())) return res.status(400).json({ error: 'Invalid updatedAfter' });
    q.updatedAt = { $gt: d };
  }
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
    const { name, type, muscles } = req.body as { name?: string; type?: ExerciseType; muscles?: Muscles[] };
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
      { new: true },
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
    const updated = await ExerciseRecordModel.findOneAndUpdate(
      { _id, userId, archived: { $ne: true } },
      { archived: true },
      { new: true },
    );
    if (!updated) return res.status(404).json({ error: 'Record not found' });
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
    const update: any = {
      kind, date, note, weight, rpe, restSec,
    };
    if (exerciseId) update.exerciseId = new mongoose.Types.ObjectId(exerciseId);
    if (kind === 'REPS') {
      update.repsAmount = repsAmount;
      update.durationMs = undefined;
    } else if (kind === 'TIME') {
      update.durationMs = durationMs;
      update.repsAmount = undefined;
    }
    const result = await ExerciseRecordModel.findOneAndUpdate(
      { _id, userId, archived: { $ne: true } },
      update,
      { new: true },
    );
    if (!result) return res.status(404).json({ error: 'Record not found' });
    return res.json(result);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

// Create record
exercisesRouter.post('/:exerciseId/records', async (req: AuthedRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { exerciseId } = req.params;
    const exerciseObjectId = new mongoose.Types.ObjectId(exerciseId);
    const {
      _id, kind, repsAmount, durationMs, date, note, weight, rpe, restSec,
    } = req.body as ExerciseRecordCreateRequest;
    const created = await ExerciseRecordModel.create({
      userId,
      ...(typeof _id === 'string' ? { _id: new mongoose.Types.ObjectId(_id) } : {}),
      exerciseId: exerciseObjectId,
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
  const {
    page, pageSize, sortBy, sortOrder,
  } = getPagination(req);
  const {
    dateFrom, dateTo, timeFrom, timeTo, muscles, exerciseIds, archived, updatedAfter,
  } = req.query as any;
  const includeArchived = String(archived || 'false') === 'true';
  const q: any = includeArchived ? { userId: userObjectId } : { userId: userObjectId, archived: { $ne: true } };
  if (updatedAfter) {
    const d = new Date(String(updatedAfter));
    if (Number.isNaN(d.valueOf())) return res.status(400).json({ error: 'Invalid updatedAfter' });
    q.updatedAt = { $gt: d };
  }
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
    {
      $lookup: {
        from: 'exercises', localField: 'exerciseId', foreignField: '_id', as: 'exercise',
      },
    },
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
        archived: 1,
        createdAt: 1,
        updatedAt: 1,
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
          archived: '$exercise.archived',
          createdAt: '$exercise.createdAt',
          updatedAt: '$exercise.updatedAt',
          name: '$exercise.name',
          type: '$exercise.type',
          muscles: '$exercise.muscles',
        },
      },
    },
  ]);
  res.json({ list, pagination: { total, page, pageSize } });
});
