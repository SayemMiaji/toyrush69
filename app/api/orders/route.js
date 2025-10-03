import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/db";
import Order from '@/models/Order'
import SiteSettings from '@/models/SiteSettings'
export async function GET(req){
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const phone = (searchParams.get('phone') || '').trim();
  if (!phone) return NextResponse.json({ orders: [] });
  // Normalize: allow searching by '01XXXXXXXXX' (no +88) or full '+88...'.
  const normalized = phone.startsWith('+88') ? phone : `+88${phone}`;
  const orders = await Order.find({ phone: { $in: [phone, normalized] } }).sort({ createdAt: -1 });
  return NextResponse.json({ orders });
}
async function sendDiscordNotification(order){
  try{
    const s = await SiteSettings.findOne({}).lean();
    const urls = s?.discordWebhooks || [];
    if(!urls.length) return;
    const itemsText = order.items.map(it => `• ${it.name} × ${it.qty} — ৳${it.price}`).join('\n').slice(0, 1500);
    const lines = [
      `🧸 New order ${order._id?.toString().slice(-6)}`,
      `Customer: ${order.name || '-'} (${order.phone})`,
      `Address: ${order.address || '-'}, ${order.city || '-'}`,
      `Delivery: ${order.delivery === 'inside' ? 'Inside Dhaka (৳60)' : 'Outside Dhaka (৳100)'}`,
      `Payment: ${order.payment === 'cod' ? 'Cash on delivery' : order.payment}`,
      order.giftWrap ? 'Gift wrap: Yes (৳50)' : null,
      '',
      itemsText,
      '',
      `Subtotal: ৳${order.subtotal} | Discount: ৳${order.discount} | Delivery: ৳${order.deliveryFee} | Gift: ৳${order.giftWrapFee || 0}`,
      `Total: **৳${order.total}**`
    ].filter(Boolean).join('\n');
    const payload = { content: lines };
    await Promise.allSettled(urls.map(u => fetch(u, {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store'
    })));
  }catch(e){
    console.error('Discord webhook failed', e);
  }
}
export async function POST(req){
  await dbConnect();
  const body = await req.json();
  const {
    name = '',
    phone = '',
    address = '',
    city = 'Dhaka',
    items = [],
    delivery = 'inside', // inside | outside
    payment = 'cod',
    coupon = null, // { type:'percent'|'fixed', amount:number, code:string }
    note = '',
    giftWrap = false
  } = body || {};
  // Basic validation
  if(!phone || !Array.isArray(items) || items.length === 0){
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }
  // Recompute prices on server to avoid tampering
  const subtotal = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);
  let discount = 0;
  if (coupon && typeof coupon === 'object') {
    if (coupon.type === 'percent') {
      discount = Math.round(subtotal * (Number(coupon.amount) || 0) / 100);
    } else if (coupon.type === 'fixed') {
      discount = Math.min(subtotal, Number(coupon.amount) || 0);
    }
  }
  const deliveryFee = items.length ? (delivery === 'inside' ? 60 : 100) : 0;
  const giftWrapFee = giftWrap ? 50 : 0;
  const total = Math.max(0, subtotal - discount) + deliveryFee + giftWrapFee;
  const order = await Order.create({
    name, phone, address, city,
    items, delivery, payment,
    coupon, subtotal, deliveryFee, discount, total,
    note,
    giftWrap, giftWrapFee,
    statusHistory:[{ status:'Placed' }],
    currentStatus:'Pending'
  });
  await sendDiscordNotification(order);
  return NextResponse.json({ id: order._id });
}
