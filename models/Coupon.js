import mongoose, { Schema } from 'mongoose';

const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent', 'fixed'], required: true },
  amount: { type: Number, required: true }, // percent 1-100 or fixed taka
  active: { type: Boolean, default: true },
  expiresAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
