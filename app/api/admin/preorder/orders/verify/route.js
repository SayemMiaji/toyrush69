import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../../lib/db";
import Order from '../../../../../../models/Order';
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
  const { orderId } = await req.json().catch(() => ({}));
  if(!orderId) return NextResponse.json({ ok:false, error:'Missing orderId' }, { status:400 });
  const order = await Order.findById(orderId);
  if(!order) return NextResponse.json({ ok:false, error:'Order not found' }, { status:404 });
  const invoiceId = order?.preorder?.uddoktaInvoiceId
    || order?.payment?.invoice_id
    || order?.metadata?.invoice_id
    || null;
  if(!invoiceId) return NextResponse.json({ ok:false, error:'No invoice id on order' }, { status:400 });
  const data = await verifyWithUddokta(invoiceId);
  if(!data) return NextResponse.json({ ok:false, error:'Cannot verify invoice' }, { status:400 });
  const isPaid = (data?.status === 'PAID' || data?.payment_status === 'COMPLETED');
  if(isPaid){
    order.preorder = order.preorder || {};
    order.preorder.advancePaid = Number(data?.amount || data?.paid_amount || 0) || order.preorder.advanceDue || 0;
    order.preorder.advancePaidAt = new Date();
    order.preorder.verified = true;
    order.preorder.uddoktaStatus = 'PAID';
    order.preorder.txnId = data?.transaction_id || data?.trx_id || null;
    await order.save();
  }
  return NextResponse.json({ ok:true, verified: isPaid, data });
}
