import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  _id: String, tokenHash: String, title: String, questions: Array, warnings: Array, exact: Boolean,
  startedAt: Date, expiresAt: Date, finishedAt: Date, durationMinutes: Number, negativeFraction: Number,
  state: mongoose.Schema.Types.Mixed, result: mongoose.Schema.Types.Mixed, revision: { type: Number, default: 0 },
  purgeAt: Date,
}, { timestamps: true });
schema.index({ purgeAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.models.MockAttempt || mongoose.model('MockAttempt', schema);
