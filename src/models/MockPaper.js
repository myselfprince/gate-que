import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  year: String, examPaper: { type: String, enum: ['CS', 'IT'], default: 'CS' }, setNum: { type: String, default: '' },
  questionCount: Number, totalMarks: Number, durationMinutes: Number, negativeFraction: Number, verified: Boolean, sourceUrl: String,
}, { timestamps: true });
schema.index({ year: 1, examPaper: 1, setNum: 1 }, { unique: true });
export default mongoose.models.MockPaper || mongoose.model('MockPaper', schema);
