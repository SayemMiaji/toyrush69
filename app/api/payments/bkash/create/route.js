import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import SiteSettings from '@/models/SiteSettings'
import Order from '@/models/Order'
function bkashBase(sandbox){
  return sandbox ? 'https://tokenized.sandbox.bka.sh' : 'https://tokenized.pay.bka.sh'
}
async function grantToken(settings){
  const url = bkashBase(settings.bkashSandbox) + '/v1.2.0-beta/tokenized/checkout/token/grant'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      username: settings.bkashUsername || '',
      password: settings.bkashPassword || '',
    },
    body: JSON.stringify({
      app_key: settings.bkashAppKey || '',
      app_secret: settings.bkashAppSecret || '',
    })
  })
  const data = await res.json()
  if(!res.ok || !data?.id_token){
    throw new Error(data?.message || 'Failed to get bKash token')
  }
  return data.id_token
}
export async function POST(req){
  try{
    await dbConnect()
    const body = await req.json()
    const { orderId, amount, payerReference = '', callbackPath = '/api/payments/bkash/callback' } = body || {}
    if(!orderId || !amount) return NextResponse.json({ error: 'orderId and amount are required' }, { status: 400 })
    const settings = await SiteSettings.findOne({}).lean()
    if(!settings?.bkashEnabled){
      return NextResponse.json({ error: 'bKash is disabled' }, { status: 400 })
    }
    const order = await Order.findById(orderId)
    if(!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    const token = await grantToken(settings)
    const base = bkashBase(settings.bkashSandbox)
    const createUrl = base + '/v1.2.0-beta/tokenized/checkout/create'
    const callbackURL = (process.env.NEXT_PUBLIC_SITE_URL || '') + callbackPath
    const payload = {
      mode: '0011',
      payerReference: payerReference || order.phone || 'N/A',
      callbackURL,
      amount: String(Number(amount).toFixed(2)),
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: String(order._id),
    }
    const res2 = await fetch(createUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        authorization: token,
        'x-app-key': settings.bkashAppKey || ''
      },
      body: JSON.stringify(payload)
    })
    const data2 = await res2.json()
    if(!res2.ok || !data2?.bkashURL || !data2?.paymentID){
      return NextResponse.json({ error: data2?.message || 'Failed to create bKash payment' }, { status: 400 })
    }
    order.bkashPaymentID = data2.paymentID
    order.paymentStatus = 'Pending'
    await order.save()
    return NextResponse.json({ bkashURL: data2.bkashURL, paymentID: data2.paymentID })
  }catch(e){
    return NextResponse.json({ error: e.message || 'bKash create error' }, { status: 500 })
  }
}
