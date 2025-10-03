import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import SeoMeta from '@/models/SeoMeta';
export async function GET(){
  await dbConnect();
  const entries = await SeoMeta.find({}).sort({ updatedAt: -1 }).lean();
  return NextResponse.json({ entries });
}
export async function POST(req){
  await dbConnect();
  const body = await req.json();
  const { path, title, description, keywords, ogImage, noindex, canonical } = body || {};
  if(!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 });
  const created = await SeoMeta.findOneAndUpdate(
    { path },
    { $set: { title, description, keywords, ogImage, noindex: !!noindex, canonical } },
    { new: true, upsert: true }
  );
  return NextResponse.json({ entry: created });
}
