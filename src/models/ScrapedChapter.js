import mongoose from 'mongoose';

const ScrapedChapterSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  questions: { type: Array, default: [] },
}, { timestamps: true });

ScrapedChapterSchema.index({ subject: 1, chapter: 1 }, { unique: true });

// We don't export the model directly. We will bind it to the connection in the API route.
export default ScrapedChapterSchema;