import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import Order from "../../../../../models/Order";
async function ensureDB(){ await dbConnect(); }
export async function POST(req){
  try{
    await ensureDB();
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ ok:false, error:"orderId is required" }, { status:400 });
    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ ok:false, error:"Order not found" }, { status:404 });
    // Mark pending with TTL hold
    const HOLD_MIN = Number(process.env.PREORDER_HOLD_MIN || 30);
    order.paymentProvider = "uddoktapay";
    order.paymentStatus   = "pending";
    order.paymentHoldUntil = new Date(Date.now() + HOLD_MIN*60*1000);
    await order.save();
    const total = order.total ?? ((order.items||[]).reduce((s,it)=> s + (Number(it.price)||0)*(Number(it.qty)||1), 0) + (Number(order.deliveryFee)||0));
    const pct   = order.preOrderAdvancePercent ?? 30;
    const amount = order.advanceAmount || Math.round((Number(total)||0) * (Number(pct)||0)/100);
    const BASE   = process.env.UDDOKTAPAY_BASE_URL || "https://toyrushbd.paymently.io";
    const APIKEY = process.env.UDDOKTAPAY_API_KEY;
    const SITE   = process.env.NEXT_PUBLIC_SITE_URL || "https://toyrushbd.com";
    if (!APIKEY) return NextResponse.json({ ok:false, error:"Missing UDDOKTAPAY_API_KEY" }, { status:500 });
    const email = (order.email && order.email.includes("@")) ? order.email
                 : (order.phone ? `${String(order.phone).replace(/\D/g,"")}@toyrush.local` : "customer@toyrush.local");
    const payload = {
      full_name: order.name || "Customer",
      email,
      amount: String(amount),
      metadata: { order_id: String(order._id), orderId: String(order._id) },
      redirect_url: `${SITE}/api/payments/uddoktapay/callback`,
      cancel_url:   `${SITE}/api/payments/uddoktapay/callback?cancel=1`,
      return_type: "GET",
      fail_url: `${SITE}/preorder-cancel`,
      success_url: `${SITE}/preorder-success`,
      callback_url: `${SITE}/api/payments/uddoktapay/callback`
};
    const r = await fetch(`${BASE}/api/checkout-v2`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "RT-UDDOKTAPAY-API-KEY": APIKEY,
      },
      body: JSON.stringify(payload),
    });
    const j = await r.json().catch(()=> ({}));
    if (!r.ok) {
      return NextResponse.json({ ok:false, error: j?.message || j?.error || `Provider ${r.status}`, provider: j }, { status:502 });
    }
    const url = j?.redirect_url || j?.payment_url || j?.checkout_url || j?.url || j?.data?.payment_url;
    if (!url) {
      return NextResponse.json({ ok:false, error:"Provider did not return a payment URL", provider: j }, { status:502 });
    }
    if (j?.invoice_id || j?.invoiceId) {
      await Order.updateOne({ _id: order._id }, { $set: { uddoktaInvoiceId: j.invoice_id || j.invoiceId } });
    }
    return NextResponse.json({ ok:true, url });
  }catch(e){
    return NextResponse.json({ ok:false, error: e.message }, { status:500 });
  }
}
