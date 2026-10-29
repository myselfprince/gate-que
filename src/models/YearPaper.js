import mongoose from 'mongoose';

// Separate collection: the book's Chapter documents are never used as writable paper storage.
const schema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, datasetId: String, title: String,
  year: String, examPaper: String, setNum: String, questionCount: Number,
  totalMarks: Number, availableMarks: Number, durationMinutes: Number,
  negativeFraction: Number, verified: Boolean, sourceUrl: String, sourceSha256: String,
  instructions: [String], questions: Array, assetManifest: mongoose.Schema.Types.Mixed,
}, { timestamps: true });
schema.index({ year: 1, examPaper: 1, setNum: 1 }, { unique: true });
export default mongoose.models.YearPaper || mongoose.model('YearPaper', schema);
