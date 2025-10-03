import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Product from '@/models/Product'
export async function POST(req){
  await dbConnect();
  const body = await req.json();
  if (!body.price) body.price = body.salePrice || body.regularPrice || 0;
  const p = await Product.create(body)
  return NextResponse.json({ id: p._id })
}
