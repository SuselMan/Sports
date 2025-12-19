import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true,
    },
    name: {
      type: String, required: true, maxlength: 100, index: true,
    },
    type: { type: String, enum: ['REPS', 'TIME'], required: true },
    muscles: { type: [String], required: true, default: [] },
    archived: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export type ExerciseDocument = mongoose.InferSchemaType<typeof exerciseSchema> & { _id: mongoose.Types.ObjectId };
export const ExerciseModel = mongoose.model('Exercise', exerciseSchema);

const exerciseRecordBase = {
  userId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true,
  },
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'Exercise', required: true, index: true,
  },
  date: { type: String, required: true }, // ISO
  note: { type: String, maxlength: 300 },
  weight: { type: Number },
  rpe: { type: Number },
  restSec: { type: Number },
  archived: { type: Boolean, default: false, index: true },
};

const exerciseRecordSchema = new mongoose.Schema(
  {
    ...exerciseRecordBase,
    kind: { type: String, enum: ['REPS', 'TIME'], required: true },
    repsAmount: { type: Number },
    durationMs: { type: Number },
  },
  { timestamps: true },
);

exerciseRecordSchema.index({ userId: 1, archived: 1, date: -1 });

export type ExerciseRecordDocument = mongoose.InferSchemaType<typeof exerciseRecordSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const ExerciseRecordModel = mongoose.model('ExerciseRecord', exerciseRecordSchema);
