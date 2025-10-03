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
    const { searchParams } = new URL(req.url)
    const paymentID = searchParams.get('paymentID') || (await req.json())?.paymentID
    if(!paymentID) return NextResponse.json({ error: 'paymentID required' }, { status: 400 })
    const settings = await SiteSettings.findOne({}).lean()
    const token = await grantToken(settings)
    const url = bkashBase(settings.bkashSandbox) + '/v1.2.0-beta/tokenized/checkout/execute/' + paymentID
    const res2 = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: token,
        'x-app-key': settings.bkashAppKey || ''
      }
    })
    const data2 = await res2.json()
    if(!res2.ok || !data2?.trxID){
      return NextResponse.json({ error: data2?.message || 'Failed to execute payment' }, { status: 400 })
    }
    const orderId = data2?.merchantInvoiceNumber
    if(orderId){
      const order = await Order.findById(orderId)
      if(order){
        order.payment = 'bkash'
        order.paymentStatus = 'Paid'
        order.bkashTrxID = data2.trxID
        order.currentStatus = 'Advance Paid'
        await order.save()
      }
    }
    return NextResponse.json({ ok: true, trxID: data2.trxID, data: data2 })
  }catch(e){
    return NextResponse.json({ error: e.message || 'bKash execute error' }, { status: 500 })
  }
}
