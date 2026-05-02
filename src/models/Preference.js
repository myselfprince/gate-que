import mongoose from 'mongoose';

const PreferenceSchema = new mongoose.Schema({
  user: { type: String, required: true, unique: true }, // We'll just hardcode 'admin' for you
  lastSubject: { type: String, required: true },
  lastChapter: { type: String, required: true }
});

export default mongoose.models.Preference || mongoose.model('Preference', PreferenceSchema);