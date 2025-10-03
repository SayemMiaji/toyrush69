import SiteSettings from "../models/SiteSettings";

async function postJSON(url, body, timeoutMs = 10000){
  const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  const t = setTimeout(() => ctrl?.abort && ctrl.abort(), timeoutMs);
  try{
    const res = await fetch(url, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl?.signal,
     });
    return res;
  } finally {
    if (t) clearTimeout(t);
  }
}

import { dbConnect } from "./db";

async function ensureDB(){ return dbConnect(); }

export async function sendAdminWebhooks(event, payload) {
  await ensureDB();
  const s = await SiteSettings.findOne({}, null, { sort: { createdAt: -1 } });
  const list = s?.webhooks || [];
  for (const h of list) {
    const url = typeof h === 'string' ? h : h?.url;
    if (!url) continue;
    try {
      // Discord expects JSON with "content"
      const body = {
        content: `**${event}**\n\n` + "```json\n" + JSON.stringify(payload, null, 2) + "\n```"
      };
      
      try {
        const hasAbort = typeof AbortController !== 'undefined';
        const ctrl = hasAbort ? new AbortController() : null;
        const t = hasAbort ? setTimeout(()=> ctrl.abort(), 5000) : null;
        const opts = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        };
        if (ctrl) opts.signal = ctrl.signal;
        await postJSON(url, opts);
        if (t) if (t) clearTimeout(t);
      } catch(err) {
        // swallow webhook errors (do not block)
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Webhook send failed", e);
    }
  }
}


function money(n){ try { return new Intl.NumberFormat('en-BD').format(Math.round(Number(n)||0)); } catch { return String(n); } }
function shortId(id){ return String(id||'').slice(-6); }
function safe(v, d='—'){ return (v===0 ? '0' : (v || d)); }

export function buildPreorderWebhookText(order={}, product=null){
  const id = shortId(order._id);
  const name = safe(order.name);
  const phone = safe(order.phone);
  const city = safe(order.city);
  const address = [safe(order.address,''), safe(order.city,'')].filter(Boolean).join(', ') || '—';
  const deliveryFee = order.deliveryFee ?? order.delivery_fee ?? order.delivery ?? 0;
  const deliveryLabel = order.deliveryLabel || (deliveryFee>0 ? (city?.toLowerCase().includes('dhaka') ? 'Inside Dhaka' : 'Outside Dhaka') : 'N/A');
  const subtotal = order.subtotal ?? (order.total && order.advanceAmount ? (Number(order.total)||0) : 0);
  const discount = order.discount ?? 0;
  const gift = order.gift ?? 0;
  const total = order.total ?? (Number(subtotal) - Number(discount) + Number(deliveryFee) + Number(gift));

  const paid = order.advanceAmount ?? order.preOrderAdvanceAmount ?? 0;
  const due = (Number(total)||0) - (Number(paid)||0);

  const items = Array.isArray(order.items) && order.items.length ? order.items : (
    (order.productName || product?.title || product?.name) ? [{
      title: order.productName || product?.title || product?.name,
      qty: order.qty || order.quantity || 1,
      price: order.unitPrice || product?.price || order.price || 0
    }] : []
  );

  const lines = [];
  lines.push(`🧸 New pre‑order ${id}`);
  lines.push(`Customer:  ${name} (${phone})`);
  lines.push(`Address: ${address}`);
  lines.push(`Delivery: ${deliveryLabel} (৳${money(deliveryFee)})`);
  lines.push(`Payment: Advance ৳${money(paid)} • Due on COD ৳${money(due)}`);

  for (const it of items){
    const t = (Number(it.price)||0) * (Number(it.qty)||1);
    const title = it.title || it.name || 'Item';
    lines.push(`• ${title} × ${it.qty||1} — ৳${money(t)}`);
  }

  lines.push(`Subtotal: ৳${money(subtotal)} | Discount: ৳${money(discount)} | Delivery: ৳${money(deliveryFee)} | Gift: ৳${money(gift)}`);
  lines.push(`Total: ৳${money(total)}`);
  return lines.join('\n');
}

export async function sendPreorderCreated(orderLike){
  try{
    await ensureDB();
    let order = orderLike;
    if (typeof orderLike === 'string'){
      const mod = await import("../models/Order.js");
      const Order = mod.default || mod;
      order = await Order.findById(orderLike).lean();
    }
    if (!order) return;
    let product = null;
    try{
      const prodMod = await import("../models/Product.js");
      const Product = prodMod.default || prodMod;
      const slug = order.slug || order.productSlug || order.items?.[0]?.slug;
      const pid = order.productId || order.items?.[0]?.productId;
      if (slug) product = await Product.findOne({ slug }, { title:1, name:1, price:1, images:1 }).lean();
      else if (pid) product = await Product.findById(pid, { title:1, name:1, price:1, images:1 }).lean();
    }catch{}
    const text = buildPreorderWebhookText(order, product);
    await sendAdminWebhooks('preorder.created', { text, id: String(order._id) });
  }catch(e){
    console.error("sendPreorderCreated failed", e);
  }
}
