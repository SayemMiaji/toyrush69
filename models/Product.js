import mongoose, { Schema } from 'mongoose';

const ProductSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  regularPrice: { type: Number, default: 0 },
  salePrice: { type: Number, default: 0 },
  category: { type: String, index: true },
  images: [{ type: String }],
  quantity: { type: Number, default: 0 },
  soldOut: { type: Boolean, default: false },
  description: { type: String, default: '' },
  videoUrl: { type: String, default: '' },

  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },

  hot: { type: Boolean, default: false },
  // Pre-order
  isPreOrder: { type: Boolean, default: false },
  preOrderAdvancePercent: { type: Number, default: 50 },
  preOrderLeadTimeText: { type: String, default: '' },

}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
