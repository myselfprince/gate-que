import mongoose from 'mongoose';

const TargetSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  targetCount: { type: Number, default: 0 }
}, { timestamps: true });

TargetSchema.index({ subject: 1, chapter: 1 }, { unique: true });

export default mongoose.models.Target || mongoose.model('Target', TargetSchema);