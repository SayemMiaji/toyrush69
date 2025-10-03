import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Order from "../../../../models/Order";
async function verifyWithUddokta(invoiceId){
  const base = process.env.UDDOKTAPAY_BASE_URL || process.env.UDDOKTAPAY_BASE || 'https://sandbox.uddoktapay.com';
  const key = process.env.UDDOKTAPAY_API_KEY || process.env.UDDOKTAPAY_SANDBOX_API_KEY;
  if(!key) return null;
  const url = base.replace(/\/$/, '') + '/api/invoice/' + encodeURIComponent(invoiceId);
  const res = await fetch(url, { headers: { 'accept':'application/json', 'RT-UDDOKTA-KEY': key }, cache:'no-store' });
  if(!res.ok) return null;
  return res.json();
}
export async function POST(req){
  await dbConnect();
  let payload = {};
  try { payload = await req.json(); } catch{}
  const invoiceId = payload?.invoice_id || payload?.invoiceId;
  const status = payload?.status || payload?.payment_status;
  if(!invoiceId){
    return NextResponse.json({ ok:false, error:'Missing invoice_id' }, { status:400 });
  }
  const data = await verifyWithUddokta(invoiceId);
  if(!data){
    return NextResponse.json({ ok:false, error:'Cannot verify invoice' }, { status:400 });
  }
  const isPaid = (data?.status === 'PAID' || data?.payment_status === 'COMPLETED');
  const amount = Number(data?.amount || data?.paid_amount || 0);
  const orderId = data?.metadata?.orderId || payload?.metadata?.orderId;
  const order = orderId ? await Order.findById(orderId) : await Order.findOne({ 'preorder.uddoktaInvoiceId': invoiceId });
  if(!order){
    return NextResponse.json({ ok:false, error:'Order not found' }, { status:404 });
  }
  if(isPaid){
    order.preorder = order.preorder || {};
    order.preorder.advancePaid = amount || order.preorder.advanceDue || 0;
    order.preorder.advancePaidAt = new Date();
    order.preorder.verified = true;
    order.preorder.uddoktaStatus = 'PAID';
    order.preorder.txnId = data?.transaction_id || data?.trx_id || null;
    await order.save();
  }else{
    order.preorder = order.preorder || {};
    order.preorder.uddoktaStatus = status || data?.status || 'FAILED';
    await order.save();
  }
  return NextResponse.json({ ok:true });
}
