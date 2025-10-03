import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
export async function GET(req){
  await dbConnect()
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const paymentID = searchParams.get('paymentID')
  const orderId = searchParams.get('merchantInvoiceNumber')
  if(status === 'success' && paymentID){
    try{
      await fetch((process.env.NEXT_PUBLIC_SITE_URL || '') + '/api/payments/bkash/execute?paymentID=' + encodeURIComponent(paymentID), { method: 'POST' })
    }catch{}
    const redirectTo = (process.env.NEXT_PUBLIC_SITE_URL || '') + '/thank-you' + (orderId ? ('?order=' + orderId) : '')
    return NextResponse.redirect(redirectTo)
  }
  const redirectTo = (process.env.NEXT_PUBLIC_SITE_URL || '') + '/preorder-failed'
  return NextResponse.redirect(redirectTo)
}
