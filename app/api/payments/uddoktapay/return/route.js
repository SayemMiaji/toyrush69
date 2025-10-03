import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import Order from "../../../../../models/Order";
async function ensureDB(){ await dbConnect(); }
export async function GET(req) {
  await ensureDB();
  const { searchParams } = new URL(req.url);
  const invoice_id = searchParams.get("invoice_id");
  const orderId = searchParams.get("orderId");
  if (!invoice_id || !orderId) {
    return NextResponse.redirect(new URL(`/preorder-status?error=missing_params`, req.url));
  }
  // Verify invoice
  const s = await getSiteSettings();
  const UDDOKTAPAY_API_URL = process.env.UDDOKTAPAY_API_URL || "https://sandbox.uddoktapay.com";
  const UDDOKTAPAY_API_KEY = process.env.UDDOKTAPAY_UDDOKTAPAY_API_KEY;
  let ok = false, verified = null;
  if (!UDDOKTAPAY_API_KEY) {
      return NextResponse.json({ ok:false, error:"Missing UDDOKTAPAY_UDDOKTAPAY_API_KEY in environment" }, { status: 500 });
    }
    try {
    const res = await fetch(`${UDDOKTAPAY_API_URL}/api/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "RT-UDDOKTAPAY-API-KEY": UDDOKTAPAY_API_KEY
      },
      body: JSON.stringify({ invoice_id })
    });
    verified = await res.json().catch(()=>({}));
    ok = res.ok;
  } catch {}
  if (ok) {
    try {
      const order = await Order.findById(orderId);
      if (order) {
        order.preOrderAdvancePaid = true;
        order.preOrderAdvancePaidAt = new Date();
        order.status = "paid";
        await order.save();
      }
    } catch {}
    return NextResponse.redirect(new URL(`/preorder-status?order=${orderId}&ok=1`, req.url));
  }
  return NextResponse.redirect(new URL(`/preorder-status?order=${orderId}&ok=0`, req.url));
}
