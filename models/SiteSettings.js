import mongoose, { Schema } from 'mongoose';

const SiteSettingsSchema = new Schema({
  webhooks: { type: [Schema.Types.Mixed], default: [] },
    uddoktaPayApiKey: { type: String, default: "" },

    preOrderDefaultAdvancePercent: { type: Number, default: 20 },
    preOrderDefaultLeadTimeText: { type: String, default: "Ships in 2–4 weeks" },
    uddoktaPayEnabled: { type: Boolean, default: false },
    uddoktaPayBaseUrl: { type: String, default: "" },
    uddoktaPayMerchantId: { type: String, default: "" },
    uddoktaPayCallbackSecret: { type: String, default: "" },
    outboundWebhooks: [{
      url: { type: String, required: true },
      secret: { type: String, default: "" },
      events: [{ type: String }]
    }],

  siteTitle: { type: String, default: 'ToyRush Bangladesh' },
  defaultDescription: { type: String, default: 'Lego-inspired sets, RC cars, bricks & more. Dhaka-based, delivery across Bangladesh.' },
  defaultKeywords: { type: String, default: 'toys, lego, rc car, bangladesh, dhaka' },
  ogImage: { type: String, default: '' },
  twitterHandle: { type: String, default: '' },
  canonicalBase: { type: String, default: '' },
  gaMeasurementId: { type: String, default: '' },
  gtmContainerId: { type: String, default: '' },
  analyticsEnabled: { type: Boolean, default: true },
  discordWebhooks: { type: [String], default: [] },

  // Pre-order defaults
  preOrderEnabled: { type: Boolean, default: true },
  preOrderDefaultAdvancePercent: { type: Number, default: 50 },
  preOrderDefaultLeadTimeText: { type: String, default: 'It will take up to 14–20 working days to arrive at your door step after pre‑ordering.' },
  preOrderDisableCODNote: { type: String, default: 'Full COD is not available for pre‑orders. Please pay the advance using our online payment gateway.' },

  // bKash credentials
  bkashEnabled: { type: Boolean, default: false },
  bkashSandbox: { type: Boolean, default: true },
  bkashUsername: { type: String, default: '' },
  bkashPassword: { type: String, default: '' },
  bkashAppKey: { type: String, default: '' },
  bkashAppSecret: { type: String, default: '' },

}, { timestamps: true });

export default mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema);
