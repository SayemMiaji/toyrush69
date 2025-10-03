export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
// --- helpers ----------------------------------------------------
async function ensureDB(){ await dbConnect(); }
async function loadOrderModel() {
  const m = await import("../../../../../models/Order.js").catch(() => import("../../../../../models/Order"));
  return m.default || m.Order || m;
}
async function loadProductModel() {
  const m = await import("../../../../../models/Product.js").catch(() => import("../../../../../models/Product"));
  return m?.default || m?.Product || m;
}
function findInvoiceId(o){
  const tryVals = [];
  if (o?.invoiceId) tryVals.push(o.invoiceId);
  if (o?.invoice_id) tryVals.push(o.invoice_id);
  if (o?.payment?.invoice_id) tryVals.push(o.payment.invoice_id);
  if (o?.uddokta?.invoice_id) tryVals.push(o.uddokta.invoice_id);
  if (o?.metadata?.invoice_id) tryVals.push(o.metadata.invoice_id);
  if (o?.metadata?.invoiceId) tryVals.push(o.metadata.invoiceId);
  if (Array.isArray(o?.payments)) for (const p of o.payments){ if (p?.invoice_id) tryVals.push(p.invoice_id); if (p?.metadata?.invoice_id) tryVals.push(p.metadata.invoice_id); }
  if (Array.isArray(o?.transactions)) for (const p of o.transactions){ if (p?.invoice_id) tryVals.push(p.invoice_id); if (p?.metadata?.invoice_id) tryVals.push(p.metadata.invoice_id); }
  return (tryVals.find(v => typeof v === 'string' && v.trim().length >= 6) || null);
}
async function verifyUddokta(invoiceId){
  try{
    const base = process.env.UDDOKTAPAY_BASE || "https://sandbox.uddoktapay.com";
    const key = process.env.UDDOKTAPAY_API_KEY || process.env.UDDOKTAPAY_SANDBOX_API_KEY;
    if(!key) return null;
    const url = base.replace(/\/$/, "") + "/api/verify-payment";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "RT-UDDOKTAPAY-API-KEY": key
      },
      body: JSON.stringify({ invoice_id: invoiceId })
    });
    if(!res.ok) return null;
    const j = await res.json();
    return j;
  }catch(e){
    return null;
  }
}
function deriveProductMeta(o) {
  const it = Array.isArray(o.items) && o.items[0] ? o.items[0] : null;
  return {
    productTitle: o.productTitle || it?.title || it?.name || o.slug || "",
    productImage: o.productImage || it?.image || (it?.images && it.images[0]) || "",
    slug: o.slug || it?.slug || "",
    productId: o.productId || it?.productId || it?._id || null,
  };
}
function computeTotals(o) {
  const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  // Deep scan for amounts inside an object (used as last-resort)
  function collectAmountsDeep(obj) {
    const found = [];
    const seen = new Set();
    function walk(x) {
      if (!x || typeof x !== "object" || seen.has(x)) return;
      seen.add(x);
      for (const [k, v] of Object.entries(x)) {
        if (v && typeof v === "object") walk(v);
        else {
          const key = String(k).toLowerCase();
          if (key.includes("amount") || key.includes("paid")) {
            const n = toNum(v);
            if (n > 0) found.push(n);
          }
        }
      }
    }
    walk(obj);
    return found;
  }
  // 1) Compute TOTAL robustly
  let itemsSubtotal = 0;
  if (Array.isArray(o.items)) {
    for (const it of o.items) {
      const price = toNum(it?.price ?? it?.unitPrice ?? it?.amount ?? 0);
      const qty = toNum(it?.qty ?? it?.quantity ?? 1) || 1;
      itemsSubtotal += price * qty;
    }
  }
  const delivery = toNum(o?.deliveryFee ?? o?.shippingFee ?? o?.deliveryCharge ?? 0);
  let total =
    toNum(o?.total ?? o?.grandTotal ?? o?.amount ?? 0) ||
    (itemsSubtotal + delivery);
  // 2) Sum PAID
  let paid = 0;
  // 2a) Array-based payments/transactions
  const txs = Array.isArray(o?.transactions) ? o?.transactions : o?.payments;
  if (Array.isArray(txs)) {
    for (const t of txs) {
      // Normalize a wide range of "good" statuses (case-insensitive + numeric flags)
      const raw = (t?.status ?? t?.state ?? t?.payment_status ?? t?.paid_status ?? t?.result ?? "").toString().trim();
      const status = raw.toUpperCase();
      const okStatus =
        !status ||
        ["OK","DONE","CAPTURED","CONFIRMED","APPROVED","SUCCESS","SUCCESSFUL","PAID","COMPLETED","PROCESSING"].includes(status) ||
        t?.success === true || t?.paid === true || t?.status_code === 200 || t?.code === 200 || t?.ok === true;
      const badStatus = ["FAILED","CANCELLED","CANCELED","REFUNDED","VOID","ERROR","DECLINED"].includes(status);
      // Preferred explicit fields
      const candidates = [
        t?.amount, t?.charged_amount, t?.paid, t?.paid_amount, t?.amount_captured, t?.capture_amount,
        t?.advance, t?.advance_paid, t?.advanceAmount, t?.advance_amount,
        t?.trx_amount, t?.transaction_amount
      ].map(toNum).filter(n => n > 0);
      // Nested gateway response
      if (t?.gateway_response && typeof t.gateway_response === "object") {
        const nested = collectAmountsDeep(t.gateway_response);
        candidates.push(...nested);
      }
      // Generic deep scan of the tx (last resort)
      if (candidates.length === 0) {
        const deep = collectAmountsDeep(t);
        candidates.push(...deep);
      }
      // Type heuristic for advance
      const typeStr = (t?.type || t?.kind || t?.note || "").toString().toLowerCase();
      const isAdvance = typeStr.includes("advance") || typeStr.includes("pre");
      const amt = candidates.length ? Math.max(...candidates) : 0;
      if (amt > 0 && ((okStatus && !badStatus) || isAdvance)) {
        paid += amt;
      }
    }
  }
  // 2b) Top-level fallbacks
  const toppers = [
    o?.paid, o?.advance, o?.advancePaid, o?.advance_amount, o?.advanceAmount, o?.prepaid, o?.prepaidAmount
  ].map(toNum).filter(n => n > 0);
  if (toppers.length) {
    const topAmt = Math.max(...toppers);
    if (paid < topAmt) paid = topAmt;
  }
  // 2c) Absolute last-resort: scan the whole order for "amount"/"paid" numbers
  if (paid <= 0) {
    const deepAll = collectAmountsDeep(o);
    if (deepAll.length) paid = Math.max(...deepAll);
  }
  if (total > 0 && paid > total) paid = total;
  const due = Math.max(0, total - paid);
  return { paid, total, due };
}
// --- API: GET (list paid pre-orders) ----------------------------
/*__OLD__*/ 
// --- Single canonical GET for admin preorder orders ---
export async function GET(req){
  const { NextResponse } = await import('next/server');
  try{
    const url = new URL(req.url);
    const debug = url.searchParams.get('debug') === '1';
    await ensureDB();
    const Order = await loadOrderModel();
    // Pull all orders (preorders and regular); UI can filter if needed
    const docs = await Order.find({}).sort({ createdAt: -1 }).lean();
    const list = docs.map((o) => {
      const raw = o;
      const po = o.preorder || {};
      // amounts
      const advanceDue =
        Number(o.advanceAmount || 0) ||
        Number(po.advanceDue || 0) ||
        Number(o.preOrderAdvanceAmount || 0) ||
        (o.preOrderAdvancePercent != null
          ? Math.round(((Number(o.total || 0) || 0) * Number(o.preOrderAdvancePercent || 0)) / 100)
          : 0);
      const advancePaid =
        Number(po.advancePaid || 0) ||
        Number(o.paid || 0) ||
        (o.preOrderAdvancePaid ? (advanceDue || Number(o.preOrderAdvanceAmount || 0) || 0) : 0);
      // invoice id from multiple places
      const paymentsArr = Array.isArray(o.payments) ? o.payments : [];
      const payment0 = paymentsArr[0] || {};
      const invoiceId =
        po.uddoktaInvoiceId ||
        o.uddoktaInvoiceId ||
        payment0.invoiceId ||
        (o.payment && o.payment.invoice_id) ||
        (o.metadata && o.metadata.invoice_id) ||
        null;
      // uddokta status
      const uddoktaStatus =
        o.uddoktaStatus ||
        (typeof o.paymentStatus === 'string' ? o.paymentStatus.toUpperCase() : null) ||
        (payment0.status ? String(payment0.status).toUpperCase() : null) ||
        (o.preOrderAdvancePaid ? 'PAID' : 'PENDING') ||
        'PENDING';
      const paid = (advancePaid > 0) || (uddoktaStatus === 'PAID' || uddoktaStatus === 'COMPLETED');
      // normalize address: may be string or object
      let address = null;
      if (o.address && typeof o.address === 'object') address = o.address;
      else if (o.address && typeof o.address === 'string') address = { address: o.address, city: o.city || null };
      else address = { address: o.address || null, city: o.city || null };
      // customer
      const customer = o.customer || {
        name: o.name || null,
        phone: o.phone || null,
        email: o.email || null,
        address: (typeof o.address === 'string') ? o.address : undefined,
        city: o.city || undefined,
      };
      // items
      const items = Array.isArray(o.items) ? o.items.map(it => ({
        name: it.name || it.title || it.slug || '—',
        slug: it.slug || null,
        qty: Number(it.qty || 0),
        price: Number(it.price || 0),
      })) : [];
      return {
        id: String(o._id),
        createdAt: o.createdAt,
        customer,
        address,
        items,
        itemsCount: items.length,
        subtotal: Number(o.subtotal || 0),
        deliveryFee: Number(o.deliveryFee || 0),
        total: Number(o.total || 0),
        advanceDue: Number(advanceDue || 0),
        advancePaid: Number(advancePaid || 0),
        dueOnDelivery: Number(o.dueOnDelivery || Math.max(0, Number(o.total||0) - Number(advancePaid||0))),
        verified: Boolean(po.verified || o.preOrderAdvancePaid || paid),
        paid,
        uddoktaStatus,
        invoiceId,
        provider: payment0.provider || o.paymentProvider || null,
        paymentMethod: o.paymentMethod || payment0.method || o.payment || null,
        transactionId: o.transactionId || payment0.transaction_id || null,
        currentStatus: o.currentStatus || o.status || null,
        statusHistory: Array.isArray(o.statusHistory) ? o.statusHistory : [],
        ...(debug ? { raw } : {}),
      };
    });
    return NextResponse.json({ ok: true, orders: list });
  }catch(err){
    console.error('admin preorder orders GET (single) failed', err);
    return NextResponse.json({ ok:false, error: String(err?.message || err) }, { status: 500 });
  }
}
