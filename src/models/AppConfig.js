import mongoose from 'mongoose';

const AppConfigSchema = new mongoose.Schema({
  configName: { type: String, default: "default", unique: true },
  syllabus: { type: Object, default: {} },
  topicMapping: { type: Object, default: {} }
});

export default mongoose.models.AppConfig || mongoose.model('AppConfig', AppConfigSchema);