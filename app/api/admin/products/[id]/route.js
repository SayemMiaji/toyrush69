import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import Product from '@/models/Product'
export async function PATCH(req, { params }){
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  const p = await Product.findByIdAndUpdate(id, body, { new: true })
  return NextResponse.json(p)
}
export async function DELETE(_req, { params }){
  await dbConnect();
  const { id } = await params;
  await Product.findByIdAndDelete(id)
  return NextResponse.json({ ok: true })
}
