import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import Category from '@/models/Category'
export async function PATCH(req, { params }){
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  const c = await Category.findByIdAndUpdate(id, body, { new: true })
  return NextResponse.json(c)
}
export async function DELETE(_req, { params }){
  await dbConnect();
  const { id } = await params;
  await Category.findByIdAndDelete(id)
  return NextResponse.json({ ok:true })
}
