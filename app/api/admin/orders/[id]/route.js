import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import Order from '@/models/Order';
export async function GET(_req, { params }){
  await dbConnect();
  const { id } = await params;
  if(!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const order = await Order.findById(id);
  if(!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ order });
}
export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = await params;
  if(!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const body = await req.json();
  // Allow editing of these fields (do not allow items edit in this pass)
  const allowed = ['name','phone','address','city','delivery','payment','note','currentStatus'];
  const update = {};
  for(const k of allowed){ if(Object.prototype.hasOwnProperty.call(body, k)) update[k] = body[k] }
  const order = await Order.findByIdAndUpdate(id, update, { new: true });
  if(!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ order });
}
export async function DELETE(_req, { params }){
  await dbConnect();
  const { id } = await params;
  if(!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const res = await Order.deleteOne({ _id: id });
  if(res.deletedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
