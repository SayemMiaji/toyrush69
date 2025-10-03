import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../../lib/db";
import Order from '@/models/Order'
export async function PATCH(req, { params }){
  await dbConnect();
  const { id } = await params;
  const { status } = await req.json();
  const o = await Order.findById(id)
  if(!o) return NextResponse.json({ error:'Not found' }, { status:404 })
  o.statusHistory.push({ status });
  o.currentStatus = status;
  await o.save();
  return NextResponse.json({ ok: true })
}
