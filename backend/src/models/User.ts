import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String, required: true, index: true, unique: true,
    },
    email: { type: String, required: true, index: true },
    displayName: { type: String },
    sex: { type: String, enum: ['male', 'female', 'other'], required: false },
    birthDate: { type: String }, // ISODateString
  },
  { timestamps: true },
);

export type UserDocument = mongoose.InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const UserModel = mongoose.model('User', userSchema);
