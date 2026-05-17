import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  questions: { type: Array, default: [] },
  lockCount: { type: Number, default: 0 } // 🔥 Store lock state
}, { timestamps: true });

ChapterSchema.index({ subject: 1, chapter: 1 }, { unique: true });

// 🔥 FIX: Prevent Next.js from using a cached version of the schema
if (mongoose.models.Chapter) {
  delete mongoose.models.Chapter;
}

export default mongoose.model('Chapter', ChapterSchema);