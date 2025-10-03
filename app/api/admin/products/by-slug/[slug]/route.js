import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../../lib/db";
import Product from '@/models/Product'
export async function GET(_req, { params }){
  await dbConnect();
  const { slug } = await params;
  const p = await Product.findOne({ slug }).lean();
  if(!p) return NextResponse.json({ error:'Not found' }, { status:404 })
  return NextResponse.json({ product: p })
}
export async function PATCH(req, { params }){
  await dbConnect();
  const { slug } = await params;
  const body = await req.json();
  const p = await Product.findOneAndUpdate({ slug }, body, { new: true });
  if(!p) return NextResponse.json({ error:'Not found' }, { status:404 })
  return NextResponse.json({ product: p })
}
