import mongoose, { Schema } from 'mongoose';

const ReviewSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', index: true, required: true },
  name: { type: String, default: 'Anonymous' },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, default: '' },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
