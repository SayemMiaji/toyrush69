import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/db";
import Review from '@/models/Review'
export async function GET(req){
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const product = searchParams.get('product');
  const limit = Math.min(50, Number(searchParams.get('limit') || 20));
  if(!product) return NextResponse.json({ reviews: [] });
  const reviews = await Review.find({ productId: product, approved: true }).sort({ createdAt: -1 }).limit(limit);
  return NextResponse.json({ reviews });
}
export async function POST(req){
  await dbConnect();
  const body = await req.json();
  const { productId, name, rating, text } = body || {};
  if(!productId || !rating) return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  await Review.create({
    productId,
    name: (name || '').toString().trim() || 'Anonymous',
    rating: Number(rating),
    text: (text || '').toString().trim()
  });
  return NextResponse.json({ ok: true });
}
