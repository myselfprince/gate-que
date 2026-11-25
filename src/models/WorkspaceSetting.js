import mongoose from 'mongoose';

// One document per workspace setting group (PDF design, YouTube studio, scraper prompt).
// Values are validated by src/lib/workspace-settings.mjs before they are saved.
const WorkspaceSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true, minimize: false });

export default mongoose.models.WorkspaceSetting || mongoose.model('WorkspaceSetting', WorkspaceSettingSchema);
