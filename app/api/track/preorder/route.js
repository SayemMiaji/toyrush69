export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

/* ---------- DB ---------- */
async function ensureDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MongoDB connection string');
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 2) return;
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || undefined });
}

async function loadOrderModel() {
  try {
    const mod = await import('../../../../models/Order.js');
    return mod.default || mod.Order || mod.Orders || mod.order || mod.orders;
  } catch (e) {
    console.error('Failed to load Order model:', e);
    return null;
  }
}

/* ---------- Helpers ---------- */
const toNum = (x) => {
  const n = Number(x);
  return Number.isFinite(n) ? n : 0;
};

function isPre(o){
  return !!(o?.isPreOrder || o?.preorder || o?.kind === 'preorder' || o?.type === 'preorder' ||
            o?.preOrderAdvancePercent != null || o?.advancePercent != null || o?.productTitle);
}

// Utilities to enrich item with image + url
function firstTruthy(...vals){
  for (const v of vals){
    if (Array.isArray(v) && v.length) return v[0];
    if (v != null && v !== '') return v;
  }
  return null;
}

function buildProductUrl(order, item){
  const raw =
    item?.url || item?.link || order?.productUrl || order?.url ||
    item?.handle || order?.handle || item?.slug || order?.slug || null;

  if (!raw) return null;
  const s = String(raw);
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  return `/product/${s.replace(/^\//, '')}`;
}

function pickImage(order, item){
  return firstTruthy(
    item?.image, item?.productImage, item?.img, item?.thumbnail,
    firstTruthy(item?.images), firstTruthy(item?.gallery), firstTruthy(item?.photos),
    order?.productImage, order?.image, firstTruthy(order?.images), firstTruthy(order?.gallery)
  );
}

// Derive items with image + url
function deriveItems(o){
  const normalize = (it) => {
    const qty = Number(it?.qty ?? it?.quantity ?? 1) || 1;
    const price = Number(it?.price ?? it?.unitPrice ?? o?.unitPrice ?? o?.price ?? 0) || 0;
    const title = it?.title ?? it?.name ?? o?.productTitle ?? o?.title ?? o?.name ?? o?.slug ?? 'Item';
    const slug = it?.slug ?? o?.slug ?? null;
    const image = pickImage(o, it);
    const url = buildProductUrl(o, { ...it, slug });
    return {
      title,
      qty,
      quantity: qty,
      price,
      image: image || null,
      slug,
      url: url || null,
    };
  };
  if (Array.isArray(o?.items) && o.items.length){
    return o.items.map(normalize);
  }
  return [normalize(o)];
}

function statusLabel(s){
  const key = String(s||'').toLowerCase();
  const map = { pending:'Pending', processing:'Processing', shipped:'Shipped', delivered:'Delivered', cancelled:'Cancelled', canceled:'Cancelled', placed:'Pre‑order placed' };
  return map[key] || s || 'Status';
}

function buildTimeline(order){
  const t = [];
  if (order?.createdAt) t.push({ status:'placed', title:'Pre‑order placed', at: order.createdAt });
  if (Array.isArray(order?.statusHistory)){
    for (const h of order.statusHistory){
      t.push({ status: h.status, title: statusLabel(h.status), at: h.at || h.date || h.time || order.updatedAt || order.createdAt, note: h.note });
    }
  }
  const curr = order?.currentStatus;
  if (curr){
    const last = t.length ? String(t[t.length-1].status||'').toLowerCase() : '';
    if (String(curr).toLowerCase() !== last){
      t.push({ status: curr, title: statusLabel(curr), at: order.updatedAt || order.createdAt });
    }
  }
  t.sort((a,b)=> new Date(a.at||0) - new Date(b.at||0));
  return t;
}

/* Phone matcher (string/number & last-8) */
function buildPhoneOr(phoneInput){
  const digits = phoneInput.replace(/[^\d]/g, '');
  const last8  = digits.slice(-8);
  const fields = ['phone','phoneNumber','mobile','contact','customerPhone'];
  const or = [];

  for (const f of fields){
    if (digits) or.push({ [f]: new RegExp(digits) });
    if (last8)  or.push({ [f]: new RegExp(last8 + '$') });
    // also match numeric-typed fields
    if (digits) or.push({ $expr: { $regexMatch: { input: { $toString: '$' + f }, regex: digits } } });
    if (last8)  or.push({ $expr: { $regexMatch: { input: { $toString: '$' + f }, regex: last8 + '$' } } });
  }
  or.push({ phone: new RegExp(phoneInput, 'i') });
  return or;
}

/* Compute money using paymentStatus only */
function computeFromPaymentStatus(o, items){
  // Subtotal
  let subtotal = toNum(o?.subtotal);
  if (!subtotal) {
    const arr = Array.isArray(items) ? items : (Array.isArray(o?.items) ? o.items : []);
    subtotal = arr.reduce((s, it) => s + toNum(it?.price) * toNum(it?.qty ?? it?.quantity ?? 1), 0);
  }
  // Delivery/Total
  const delivery = toNum(o?.deliveryFee) || toNum(o?.delivery) || toNum(o?.shipping) || 0;
  const total = toNum(o?.total) || (subtotal + delivery);

  // Expected advance from %/amount/due
  const advancePercent = toNum(o?.preOrderAdvancePercent ?? o?.advancePercent ?? 0);
  const advanceAmountField = toNum(o?.preOrderAdvanceAmount ?? o?.advanceAmount ?? 0);
  const advanceDueField    = toNum(o?.advanceDue ?? o?.preOrderAdvanceDue ?? 0);
  const expectedAdvance = advanceAmountField || (advancePercent ? Math.round((total * advancePercent)/100) : 0) || advanceDueField;

  // paymentStatus decides paid/unpaid (for advance)
  const pstat = String(o?.paymentStatus || '').toLowerCase();
  const advancePaid = pstat === 'paid';
  const balancePaid = false; // full-balance not used here

  // Paid amount to show
  let paid = 0;
  if (advancePaid) {
    paid = expectedAdvance || toNum(o?.paid) || toNum(o?.paidAmount) || toNum(o?.totalPaid);
    if (!paid && advancePercent) paid = Math.round((total * advancePercent)/100);
  }
  const due = Math.max(total - paid, 0);

  return { subtotal, delivery, total, paid, due, advancePercent, advancePaid, balancePaid };
}

/* ---------- Route ---------- */
export async function POST(req){
  try {
    const body = await req.json();
    const phoneInput = (body?.phone || '').toString().trim();
    const debug = !!body?.debug;
    if (!phoneInput) return NextResponse.json({ ok:false, error:'Phone required' }, { status:400 });

    await ensureDB();
    const Order = await loadOrderModel();
    if (!Order) return NextResponse.json({ ok:false, error:'Order model not found' }, { status:500 });

    // Fetch by phone only (no boolean casting in Mongo)
    const phoneOr = buildPhoneOr(phoneInput);
    const list = await Order.find({ $or: phoneOr }).sort({ createdAt: -1 }).limit(1000).lean();

    // Keep ONLY preorders where paymentStatus === 'paid'
    const data = list
      .filter(isPre)
      .filter(o => String(o?.paymentStatus || '').toLowerCase() === 'paid')
      .map(o => {
        const items = deriveItems(o);
        const m = computeFromPaymentStatus(o, items);
        return {
          id: String(o._id ?? o.id ?? ''),
          orderId: String(o.orderId ?? o._id ?? ''),
          createdAt: o.createdAt ?? null,
          currentStatus: o.currentStatus ?? null,
          timeline: buildTimeline(o),
          name: o.name ?? '',
          phone: o.phone ?? '',
          city: o.city ?? '',
          items, // includes image + url
          subtotal: m.subtotal,
          delivery: m.delivery,
          total: m.total,
          paid: m.paid,
          due: m.due,
          advancePercent: m.advancePercent,
          advancePaid: m.advancePaid,
          balancePaid: m.balancePaid,
          type: 'preorder',
        };
      });

    if (debug) {
      return NextResponse.json({
        ok: true,
        counts: { matchedByPhone: list.length, preorders: list.filter(isPre).length, advancePaid: data.length },
        sample: list.slice(0, 3).map(o => ({
          id: String(o._id || ''),
          phone: o.phone, phoneNumber: o.phoneNumber, mobile: o.mobile,
          paymentStatus: o?.paymentStatus, advancePercent: o?.preOrderAdvancePercent ?? o?.advancePercent,
          advanceAmount: o?.preOrderAdvanceAmount ?? o?.advanceAmount, total: o?.total,
        })),
        data
      });
    }

    if (!data.length) return NextResponse.json({ ok:true, data: [], message:'No paid preorders found for this phone.' });
    return NextResponse.json({ ok:true, data });
  } catch (err) {
    console.error('track/preorder error', err);
    return NextResponse.json({ ok:false, error: String(err?.message || err) }, { status:500 });
  }
}
