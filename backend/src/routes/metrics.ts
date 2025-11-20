import { Router } from 'express';
import mongoose from 'mongoose';
import { MetricModel, MetricRecordModel } from '../models/Metric';
import { AuthedRequest } from '../auth';
import { buildSort, getPagination } from '../utils/pagination';

export const metricsRouter = Router();

metricsRouter.post('/', async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const { name, unit } = req.body as { name: string; unit: string };
    const created = await MetricModel.create({ userId, name, unit });
    res.json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

metricsRouter.get('/', async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const { page, pageSize, sortBy, sortOrder } = getPagination(req);
  const q: any = { userId };
  const total = await MetricModel.countDocuments(q);
  const list = await MetricModel.find(q)
    .sort(buildSort(sortBy!, sortOrder!) as any)
    .skip((page - 1) * pageSize)
    .limit(pageSize);
  res.json({ list, pagination: { total, page, pageSize } });
});

metricsRouter.post('/:metricId/records', async (req: AuthedRequest, res) => {
  try {
    const userId = req.userId!;
    const { metricId } = req.params;
    const { value, date, note } = req.body as { value: number; date: string; note?: string };
    const created = await MetricRecordModel.create({ userId, metricId, value, date, note });
    res.json(created);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

metricsRouter.get('/records', async (req: AuthedRequest, res) => {
  const userId = req.userId!;
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const { page, pageSize, sortBy, sortOrder } = getPagination(req);
  const { dateFrom, dateTo } = req.query as any;
  const q: any = { userId: userObjectId };
  if (dateFrom || dateTo) {
    q.date = {};
    if (dateFrom) q.date.$gte = String(dateFrom);
    if (dateTo) q.date.$lte = String(dateTo);
  }
  const pipeline: any[] = [
    { $match: q },
    { $lookup: { from: 'metrics', localField: 'metricId', foreignField: '_id', as: 'metric' } },
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
        metricId: 1,
        value: 1,
        date: 1,
        note: 1,
        metric: {
          _id: '$metric._id',
          userId: '$metric.userId',
          name: '$metric.name',
          unit: '$metric.unit',
        },
      },
    },
  ]);
  res.json({ list, pagination: { total, page, pageSize } });
});


