import { Router } from 'express';
import mongoose from 'mongoose';
import type {
  MetricCreateRequest,
  MetricUpdateRequest,
  MetricRecordCreateRequest,
  MetricRecordUpdateRequest,
} from '../../../shared/Metrics.model';
import { MetricModel, MetricRecordModel } from '../models/Metric';
import { AuthedRequest } from '../auth';
import { buildSort, getPagination } from '../utils/pagination';

export const metricsRouter = Router();

metricsRouter.post('/', async (req: AuthedRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { _id, name, unit, muscles } = req.body as MetricCreateRequest;
    const created = await MetricModel.create({
      ...(typeof _id === 'string' ? { _id: new mongoose.Types.ObjectId(_id) } : {}),
      userId,
      name,
      unit,
      muscles: muscles ?? [],
    });
    res.json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

metricsRouter.get('/', async (req: AuthedRequest, res) => {
  const userId = new mongoose.Types.ObjectId(req.userId!);
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
  const total = await MetricModel.countDocuments(q);
  const list = await MetricModel.find(q)
    .sort(buildSort(sortBy!, sortOrder!) as any)
    .skip((page - 1) * pageSize)
    .limit(pageSize);
  res.json({ list, pagination: { total, page, pageSize } });
});

metricsRouter.put('/:metricId', async (req: AuthedRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { metricId } = req.params;
    const _id = new mongoose.Types.ObjectId(metricId);
    const { name, unit, muscles } = req.body as MetricUpdateRequest;
    const update: any = {};
    if (name != null) update.name = name;
    if (unit != null) update.unit = unit;
    if (muscles != null) update.muscles = muscles;
    const updated = await MetricModel.findOneAndUpdate({ _id, userId }, update, { new: true });
    if (!updated) return res.status(404).json({ error: 'Metric not found' });
    return res.json(updated);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

metricsRouter.delete('/:metricId', async (req: AuthedRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { metricId } = req.params;
    const _id = new mongoose.Types.ObjectId(metricId);
    const updated = await MetricModel.findOneAndUpdate({ _id, userId }, { archived: true }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Metric not found' });
    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

metricsRouter.post('/:metricId/records', async (req: AuthedRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { metricId } = req.params;
    const metricObjectId = new mongoose.Types.ObjectId(metricId);
    const { _id, value, date, note } = req.body as MetricRecordCreateRequest;
    const created = await MetricRecordModel.create({
      userId,
      ...(typeof _id === 'string' ? { _id: new mongoose.Types.ObjectId(_id) } : {}),
      metricId: metricObjectId,
      value,
      date,
      note,
    });
    res.json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// Delete a record
metricsRouter.delete('/records/:recordId', async (req: AuthedRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { recordId } = req.params;
    const _id = new mongoose.Types.ObjectId(recordId);
    const updated = await MetricRecordModel.findOneAndUpdate(
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
metricsRouter.put('/records/:recordId', async (req: AuthedRequest, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const { recordId } = req.params;
    const _id = new mongoose.Types.ObjectId(recordId);
    const {
      metricId,
      value,
      date,
      note,
    } = req.body as MetricRecordUpdateRequest;
    const update: any = {};
    if (metricId != null) update.metricId = new mongoose.Types.ObjectId(metricId);
    if (value != null) update.value = value;
    if (date != null) update.date = date;
    if (note === null) update.note = undefined;
    else if (note != null) update.note = note;
    const result = await MetricRecordModel.findOneAndUpdate(
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

metricsRouter.get('/records', async (req: AuthedRequest, res) => {
  const userObjectId = new mongoose.Types.ObjectId(req.userId!);
  const {
    page, pageSize, sortBy, sortOrder,
  } = getPagination(req);
  const { dateFrom, dateTo, archived, updatedAfter } = req.query as any;
  const includeArchived = String(archived || 'false') === 'true';
  const q: any = includeArchived ? { userId: userObjectId } : { userId: userObjectId, archived: { $ne: true } };
  if (updatedAfter) {
    const d = new Date(String(updatedAfter));
    if (Number.isNaN(d.valueOf())) return res.status(400).json({ error: 'Invalid updatedAfter' });
    q.updatedAt = { $gt: d };
  }
  if (dateFrom || dateTo) {
    q.date = {};
    if (dateFrom) q.date.$gte = String(dateFrom);
    if (dateTo) q.date.$lte = String(dateTo);
  }
  const pipeline: any[] = [
    { $match: q },
    {
      $lookup: {
        from: 'metrics', localField: 'metricId', foreignField: '_id', as: 'metric',
      },
    },
    { $unwind: '$metric' },
  ];
  const sortSpec = sortBy === 'name' ? { 'metric.name': sortOrder === 'asc' ? 1 : -1 } : { date: sortOrder === 'asc' ? 1 : -1 };
  const totalAgg = await MetricRecordModel.aggregate([...pipeline, { $count: 'cnt' }]);
  const total = totalAgg[0]?.cnt || 0;
  const list = await MetricRecordModel.aggregate([
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
        metricId: 1,
        value: 1,
        date: 1,
        note: 1,
        metric: {
          _id: '$metric._id',
          userId: '$metric.userId',
          archived: '$metric.archived',
          createdAt: '$metric.createdAt',
          updatedAt: '$metric.updatedAt',
          name: '$metric.name',
          unit: '$metric.unit',
        },
      },
    },
  ]);
  res.json({ list, pagination: { total, page, pageSize } });
});
