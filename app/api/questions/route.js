import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/db";
import Question from '@/models/Question'
export async function GET(req){
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const product = searchParams.get('product');
  const limit = Math.min(50, Number(searchParams.get('limit') || 20));
  if(!product) return NextResponse.json({ questions: [] });
  const questions = await Question.find({ productId: product, approved: true }).sort({ createdAt: -1 }).limit(limit);
  return NextResponse.json({ questions });
}
export async function POST(req){
  await dbConnect();
  const body = await req.json();
  const { productId, name, text } = body || {};
  if(!productId || !text) return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  await Question.create({
    productId,
    name: (name || '').toString().trim() || 'Anonymous',
    text: (text || '').toString().trim()
  });
  return NextResponse.json({ ok: true });
}
