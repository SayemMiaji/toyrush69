import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  featured: { type: Boolean, default: false },
  image: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
