import mongoose, { Schema } from 'mongoose';

const SeoMetaSchema = new Schema({
  path: { type: String, required: true, unique: true }, // e.g., '/', '/product/slug', '/blog/post-slug'
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  keywords: { type: String, default: '' },
  ogImage: { type: String, default: '' },
  noindex: { type: Boolean, default: false },
  canonical: { type: String, default: '' },
}, { timestamps: true });


export default mongoose.models.SeoMeta || mongoose.model('SeoMeta', SeoMetaSchema);
