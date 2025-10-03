import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Question from '@/models/Question'
export async function GET(req){
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get('status') || 'pending').toLowerCase();
  const where = {};
  if(status === 'pending'){ where.approved = false }
  else if(status === 'approved'){ where.approved = true }
  const questions = await Question.find(where).sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json({ questions });
}
export async function PATCH(req){
  await dbConnect();
  const { id, approved, answer } = await req.json();
  if(!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const q = await Question.findById(id);
  if(!q) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if(typeof approved !== 'undefined') q.approved = !!approved;
  if(typeof answer === 'string') q.answer = answer;
  await q.save();
  return NextResponse.json({ ok: true });
}
export async function DELETE(req){
  await dbConnect();
  const { id } = await req.json();
  if(!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await Question.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
