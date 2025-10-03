import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Review from '@/models/Review'
import Product from '@/models/Product'
import mongoose from 'mongoose'
async function recalcProductRating(productId){
  const agg = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), approved: true } },
    { $group: { _id: '$productId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const avg = agg[0]?.avg || 0;
  const count = agg[0]?.count || 0;
  await Product.findByIdAndUpdate(productId, { ratingAvg: Math.round(avg * 10) / 10, ratingCount: count });
}
export async function GET(req){
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') || 'pending').toLowerCase(); // pending | approved | all
  const where = {};
  if(status === 'pending'){ where.approved = false }
  else if(status === 'approved'){ where.approved = true }
  const reviews = await Review.find(where).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ reviews });
}
export async function PATCH(req){
  await dbConnect();
  const { id, approved } = await req.json();
  if(!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const r = await Review.findById(id);
  if(!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  r.approved = !!approved;
  await r.save();
  await recalcProductRating(r.productId.toString());
  return NextResponse.json({ ok: true });
}
export async function DELETE(req){
  await dbConnect();
  const { id } = await req.json();
  if(!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const r = await Review.findById(id);
  if(!r) return NextResponse.json({ ok: true });
  const pid = r.productId.toString();
  await r.deleteOne();
  await recalcProductRating(pid);
  return NextResponse.json({ ok: true });
}
