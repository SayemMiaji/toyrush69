import mongoose from 'mongoose';

const PreorderRequestSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  productName: { type: String, required: true },
  productUrl: { type: String },
  whatsapp: { type: String, required: true },
  images: [{ type: String }], // store base64 data URLs or CDN URLs
  notes: { type: String },
  status: { type: String, enum: ['new','quoted','approved','ordered','delivered','rejected'], default: 'new' }
}, { timestamps: true });

export default mongoose.models.PreorderRequest || mongoose.model('PreorderRequest', PreorderRequestSchema);
