import mongoose from 'mongoose';

const DiscordConfigSchema = new mongoose.Schema({
  webhookUrl: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.DiscordConfig || mongoose.model('DiscordConfig', DiscordConfigSchema);
