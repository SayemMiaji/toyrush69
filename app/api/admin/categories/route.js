import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Category from '@/models/Category'
export async function POST(req){
  await dbConnect();
  const body = await req.json();
  const c = await Category.create(body)
  return NextResponse.json({ id: c._id })
}
