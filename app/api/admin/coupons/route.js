import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Coupon from '@/models/Coupon'
export async function GET(){
  await dbConnect();
  const coupons = await Coupon.find({}).sort({ createdAt: -1 })
  return NextResponse.json({ coupons })
}
export async function POST(req){
  await dbConnect();
  const body = await req.json();
  // Normalize code to uppercase
  if (body.code) body.code = String(body.code).toUpperCase();
  const c = await Coupon.create(body)
  return NextResponse.json({ id: c._id })
}
