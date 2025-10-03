import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import SeoMeta from '@/models/SeoMeta';
export async function PUT(req, { params }){
  await dbConnect();
  const { id } = await params;
  const body = await req.json();
  const fields = ['path','title','description','keywords','ogImage','noindex','canonical'];
  const update = {};
  for(const k of fields){ if(Object.prototype.hasOwnProperty.call(body, k)) update[k] = body[k] }
  const entry = await SeoMeta.findByIdAndUpdate(id, update, { new: true });
  if(!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ entry });
}
export async function DELETE(_req, { params }){
  await dbConnect();
  const { id } = await params;
  const res = await SeoMeta.deleteOne({ _id: id });
  if(res.deletedCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
