import mongoose, { Schema } from 'mongoose';

const PopupSchema = new Schema({
  title: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, default: '' },
  active: { type: Boolean, default: false },
  startAt: { type: Date, default: null },
  endAt: { type: Date, default: null },
  dismissible: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Popup || mongoose.model('Popup', PopupSchema);
