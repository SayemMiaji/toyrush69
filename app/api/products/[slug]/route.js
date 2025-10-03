import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Product from '@/models/Product'
export async function GET(_req, ctx){
  await dbConnect()
  const { slug } = await ctx.params
  const product = await Product.findOne({ slug }).lean()
  if(!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}
