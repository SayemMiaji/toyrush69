import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import PreorderRequest from '@/models/PreorderRequest';

export async function GET(req) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;
    const total = await PreorderRequest.countDocuments({});
    const items = await PreorderRequest.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    return NextResponse.json({ ok:true, data: items, page, limit, total });
  } catch (e) {
    console.error('admin preorder requests list failed', e);
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}
