import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import Coupon from '@/models/Coupon'
export async function PATCH(req, { params }){
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  if (body.code) body.code = String(body.code).toUpperCase();
  const c = await Coupon.findByIdAndUpdate(id, body, { new: true })
  return NextResponse.json(c)
}
export async function DELETE(_req, { params }){
  await dbConnect();
  const { id } = await params;
  await Coupon.findByIdAndDelete(id)
  return NextResponse.json({ ok:true })
}
