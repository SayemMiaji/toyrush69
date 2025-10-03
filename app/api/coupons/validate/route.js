import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Coupon from '@/models/Coupon'
export async function GET(req){
  await dbConnect();
  const { searchParams } = new URL(req.url)
  const code = (searchParams.get('code') || '').toUpperCase().trim()
  if (!code) return NextResponse.json({ valid:false, reason:'Missing code' }, { status:400 })
  const c = await Coupon.findOne({ code })
  if (!c || !c.active) return NextResponse.json({ valid:false, reason:'Invalid or inactive' }, { status:404 })
  if (c.expiresAt && new Date(c.expiresAt) < new Date()) return NextResponse.json({ valid:false, reason:'Expired' }, { status:410 })
  return NextResponse.json({ valid:true, type:c.type, amount:c.amount, code:c.code })
}
