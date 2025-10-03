import mongoose, { Schema } from 'mongoose';

const QuestionSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', index: true, required: true },
  name: { type: String, default: 'Anonymous' },
  text: { type: String, required: true },
  answer: { type: String, default: '' },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
