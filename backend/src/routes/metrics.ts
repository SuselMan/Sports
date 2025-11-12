import { Router } from 'express';
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
    .sort(buildSort(sortBy!, sortOrder!))
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
  const { page, pageSize, sortBy, sortOrder } = getPagination(req);
  const { dateFrom, dateTo, timeFrom, timeTo } = req.query as any;
  const q: any = { userId };
  if (dateFrom || dateTo) {
    q.date = {};
    if (dateFrom) q.date.$gte = String(dateFrom);
    if (dateTo) q.date.$lte = String(dateTo);
  }
  const total = await MetricRecordModel.countDocuments(q);
  const list = await MetricRecordModel.find(q)
    .sort(buildSort(sortBy!, sortOrder!))
    .skip((page - 1) * pageSize)
    .limit(pageSize);
  res.json({ list, pagination: { total, page, pageSize } });
});


