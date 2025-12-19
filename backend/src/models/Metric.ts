import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true,
    },
    name: {
      type: String, required: true, maxlength: 100, index: true,
    },
    unit: { type: String, required: true, maxlength: 20 },
    muscles: { type: [String], required: false, default: [] },
    archived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export type MetricDocument = mongoose.InferSchemaType<typeof metricSchema> & { _id: mongoose.Types.ObjectId };
export const MetricModel = mongoose.model('Metric', metricSchema);

const metricRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true,
    },
    metricId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'Metric', required: true, index: true,
    },
    value: { type: Number, required: true },
    date: { type: String, required: true }, // ISO
    note: { type: String },
    archived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

metricRecordSchema.index({ userId: 1, archived: 1, date: -1 });

export type MetricRecordDocument = mongoose.InferSchemaType<typeof metricRecordSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const MetricRecordModel = mongoose.model('MetricRecord', metricRecordSchema);
