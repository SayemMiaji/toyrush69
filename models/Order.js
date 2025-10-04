import mongoose, { Schema } from 'mongoose';

const OrderSchema = new Schema({
  _preorderWebhookSent: { type: Boolean, default: false },
    isPreOrder: { type: Boolean, default: false },
    preOrderAdvancePercent: { type: Number, default: null },
    preOrderAdvanceAmount: { type: Number, default: 0 },
    preOrderBalanceDue: { type: Number, default: 0 },
    preOrderAdvancePaid: { type: Boolean, default: false },
    preOrderAdvancePaidAt: { type: Date, default: null },
    preOrderBalancePaid: { type: Boolean, default: false },
    preOrderBalancePaidAt: { type: Date, default: null },

  phone: { type: String,
  email: { type: String }, required: true, index: true },
  name: { type: String },
  address: { type: String },
  city: { type: String, default: 'Dhaka' },
  delivery: { type: String, enum: ['inside','outside'], default: 'inside' },
  payment: { type: String, default: 'cod' },
  note: { type: String },
  // Pricing breakdown
  coupon: { type: Object, default: null },
  subtotal: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  giftWrap: { type: Boolean, default: false },
  giftWrapFee: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String, price: Number, qty: Number, slug: String, image: String
  }],
  statusHistory: [{ status: String, at: { type: Date, default: Date.now } }],
  currentStatus: { type: String, default: 'Placed' },
  // Pre-order fields (optional)
  isPreOrder: { type: Boolean, default: false },
  preOrderAdvancePercent: { type: Number, default: 0 },
  advanceAmount: { type: Number, default: 0 },
  dueOnDelivery: { type: Number, default: 0 },
  preOrderNote: { type: String, default: '' },
  paymentHoldUntil: { type: Date, index: true, default: undefined },
  senderNumber: { type: String, default: '' },
  paymentMethod: { type: String, default: '' },
  transactionId: { type: String, default: '' },
  uddoktaInvoiceId: { type: String, default: '' },
  paymentProvider: { type: String, default: '' },


  // bKash payment tracking
  bkashPaymentID: { type: String, default: '' },
  bkashTrxID: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending','paid','cancelled'], default: 'pending' },

  // Pre-order fields (optional)
  isPreOrder: { type: Boolean, default: false },
  preOrderAdvancePercent: { type: Number, default: 0 },
  advanceAmount: { type: Number, default: 0 },
  dueOnDelivery: { type: Number, default: 0 },
  preOrderNote: { type: String, default: '' },
  paymentHoldUntil: { type: Date, index: true, default: undefined },
  senderNumber: { type: String, default: '' },
  paymentMethod: { type: String, default: '' },
  transactionId: { type: String, default: '' },
  uddoktaInvoiceId: { type: String, default: '' },
  paymentProvider: { type: String, default: '' },
  
  
  advancePaid: { type: Number, default: 0 },
  advanceDue: { type: Number, default: 0 },
  advancePaidAt: { type: Date, default: null },
  verified: { type: Boolean, default: false },
  uddoktaStatus: { type: String, default: '' },
  txnId: { type: String, default: '' }
  

}, { timestamps: true });


// Auto‑notify webhooks when a preorder is created (once)
OrderSchema.post('save', async function(doc){
  try{
    if (doc?.isPreOrder && !doc._preorderWebhookSent){
      const { sendPreorderCreated } = await import('../lib/webhooks.js');
      sendPreorderCreated(doc.toObject()).catch(()=>{});
      try {
        const mongooseMod = await import('mongoose');
        const mongoose = mongooseMod.default || mongooseMod;
        await mongoose.connection.collection('orders').updateOne({ _id: doc._id }, { $set: { _preorderWebhookSent: true } });
      } catch {}
    }
  }catch(e){
    console.error('preorder webhook hook error', e);
  }
});


export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
