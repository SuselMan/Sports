import { Router } from 'express';
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
  const q: any = { userId };
  const total = await ExerciseModel.countDocuments(q);
  const list = await ExerciseModel.find(q)
    .sort(buildSort(sortBy!, sortOrder!))
    .skip((page - 1) * pageSize)
    .limit(pageSize);
  res.json({ list, pagination: { total, page, pageSize } });
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
  const { page, pageSize, sortBy, sortOrder } = getPagination(req);
  const { dateFrom, dateTo, timeFrom, timeTo, muscles, exerciseIds } = req.query as any;
  const q: any = { userId };
  if (exerciseIds) q.exerciseId = { $in: String(exerciseIds).split(',') };
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
  // muscles filter: join via exercise lookup
  let pipeline: any[] = [{ $match: q }];
  if (muscles) {
    const muscleList = String(muscles).split(',');
    pipeline = [
      { $match: q },
      { $lookup: { from: 'exercises', localField: 'exerciseId', foreignField: '_id', as: 'ex' } },
      { $unwind: '$ex' },
      { $match: { 'ex.muscles': { $in: muscleList } } },
    ];
  }
  const sortStage = { $sort: buildSort(sortBy!, sortOrder!) as any };
  const totalAgg = await ExerciseRecordModel.aggregate([...pipeline, { $count: 'cnt' }]);
  const total = totalAgg[0]?.cnt || 0;
  const list = await ExerciseRecordModel.aggregate([
    ...pipeline,
    sortStage,
    { $skip: (page - 1) * pageSize },
    { $limit: pageSize },
  ]);
  res.json({ list, pagination: { total, page, pageSize } });
});


