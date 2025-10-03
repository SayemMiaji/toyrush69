export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { verify, isExpired } from '@/lib/auth'
import { allow } from '@/lib/rateLimit'
import { dbConnect } from "../../../../lib/db";
async function ensureDB() {
  await dbConnect();
}

  


function statusLabel(s){
  const key = String(s||'').toLowerCase();
  const map = {
    'processing':'Processing',
    'packed':'Packed',
    'shipped':'Shipped',
    'out_for_delivery':'Out for delivery',
    'delivered':'Delivered',
    'cancelled':'Cancelled',
    'returned':'Returned',
    'ready_for_pickup':'Ready for pickup',
    'awaiting_payment':'Awaiting payment',
    'confirmed':'Confirmed',
    'preparing':'Preparing',
    'dispatched':'Dispatched',
    'hold':'On hold',
  };
  return map[key] || (s ? (s[0].toUpperCase()+s.slice(1)) : '');
}

function buildTimeline(order){
  const t = [];
  // Placed
  if (order?.createdAt) t.push({ status:'placed', title:'Order placed', at: order.createdAt });
  // History array from DB (if any)
  if (Array.isArray(order?.statusHistory)){
    for (const h of order.statusHistory){
      t.push({ status: h.status, title: statusLabel(h.status), at: h.at || h.date || h.time || order.updatedAt || order.createdAt, note: h.note });
    }
  }
  // Current status if not already last
  const curr = order?.currentStatus;
  if (curr){
    const last = t.length ? String(t[t.length-1].status||'').toLowerCase() : '';
    if (String(curr).toLowerCase() !== last){
      t.push({ status: curr, title: statusLabel(curr), at: order.updatedAt || order.createdAt });
    }
  }
  // Sort ascending by time if timestamps exist
  t.sort((a,b)=> new Date(a.at||0) - new Date(b.at||0));
  return t;
}
async function loadOrderModel(){
  try{
    const m = await import("../../../../models/Order.js").catch(()=>import("../../../../models/Order"));
    return m.default ?? m;
  } catch(e){
    return null;
  }
}
function normPhone(raw){
  const s = String(raw||"").trim();
  const digits = s.replace(/\D+/g, "");
  // Bangladesh: prefer 11-digit local starting with 01, and +8801... variants
  let local = digits;
  if (digits.startsWith("88") && digits.length >= 13) local = digits.slice(-11);
  if (digits.startsWith("880") && digits.length >= 13) local = digits.slice(-11);
  if (digits.length > 11) local = digits.slice(-11);
  if (local.length === 10 && local[0] === "1") local = "0"+local;
  const intl = "+880" + (local.startsWith("0") ? local.slice(1) : local);
  return { local, intl, last11: local.slice(-11) };
}
function escapeRegExp(str){ return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function deriveItems(o){
  const items = Array.isArray(o?.items) ? o.items : Array.isArray(o?.cart?.items) ? o.cart.items : [];
  return items.map(it => ({
    title: it?.title ?? it?.name ?? it?.productTitle ?? it?.slug ?? "Item",
    qty: Number(it?.qty ?? it?.quantity ?? 1) || 1,
    price: Number(it?.price ?? it?.unitPrice ?? 0) || 0,
    image: it?.image ?? it?.productImage ?? null,
    slug: it?.slug ?? it?.productSlug ?? null,
    productId: it?.productId ?? it?.product ?? it?._id ?? null,
  }));
}
function computeTotals(o){
  const items = deriveItems(o);
  const subtotal = items.reduce((s, it)=> s + (Number(it.price)||0) * (Number(it.qty)||1), 0);
  const delivery = Number(o?.deliveryFee ?? o?.shippingFee ?? o?.deliveryCharge ?? 0) || 0;
  const total = Number(o?.total ?? o?.grandTotal ?? (subtotal + delivery)) || (subtotal + delivery);
  const paid = typeof o?.paid === "number" ? o.paid :
    Array.isArray(o?.payments) ? o.payments.reduce((s,p)=> s + (Number(p?.amount)||0), 0) : 0;
  const due = Math.max(total - paid, 0);
  return { subtotal, delivery, total, paid, due };
}
export async function POST(req){
  let body = {};
  try { body = await req.json(); } catch {}

  await ensureDB();
  const Order = await loadOrderModel();
  if (!Order) return NextResponse.json({ ok:false, error:"Order model not found" }, { status:500 });
  // --- Rate limit & captcha ---
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown';
  if (!allow(ip, 10)) return NextResponse.json({ ok:false, error:'Rate limit exceeded. Try again later.' }, { status:429 });
  const captchaAnswer = body?.captchaAnswer;
  const captchaToken = body?.captchaToken;
  try {
    const AUTH_SECRET = process.env.AUTH_SECRET || 'dev-secret';
    const c = verify(captchaToken, AUTH_SECRET);
    if (!c || c.typ !== 'captcha' || isExpired(c)) {
      return NextResponse.json({ ok:false, error:'Captcha expired. Please refresh and try again.' }, { status:400 });
    }
    if (Number(captchaAnswer) !== Number(c.n1) + Number(c.n2)) {
      return NextResponse.json({ ok:false, error:'Captcha incorrect.' }, { status:400 });
    }
  } catch (e) {
    return NextResponse.json({ ok:false, error:'Captcha validation failed.' }, { status:400 });
  }
const phone = body?.phone ?? "";
  const { local, intl, last11 } = normPhone(phone);
  const rx = new RegExp(escapeRegExp(last11) + "$");
  const list = await Order.find({ $and: [ { $or: [ { phone: local }, { phone: intl }, { phone: { $regex: rx } } ] }, { $or: [ { isPreOrder: false }, { isPreOrder: { $exists: false } } ] } ] }).sort({ createdAt: -1 }).limit(50).lean();
  const data = list.map(o => {
    const { subtotal, delivery, total, paid, due } = computeTotals(o);
    return {
      id: String(o._id),
      createdAt: o.createdAt ?? o.created_at ?? null,
      status: (o.currentStatus || o.status || 'processing'),
      timeline: buildTimeline(o),
      name: o.name ?? o.customerName ?? "",
      phone: o.phone ?? "",
      address: o.address ?? "",
      city: o.city ?? "",
      items: deriveItems(o),
      subtotal, delivery, total, paid, due,
      type: "regular"
    };
  });
  return NextResponse.json({ ok:true, data });
}
