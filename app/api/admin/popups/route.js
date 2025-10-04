export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import Popup from "../../../../../models/Popup";

export async function GET() {
  await dbConnect();
  const list = await Popup.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, data: list });
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json();
  const { _id, ...data } = body || {};
  if (_id) {
    const doc = await Popup.findByIdAndUpdate(_id, data, { new: true });
    return NextResponse.json({ ok: true, data: doc });
  } else {
    const doc = await Popup.create(data);
    return NextResponse.json({ ok: true, data: doc });
  }
}
