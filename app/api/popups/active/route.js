export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Popup from "../../../../models/Popup";

export async function GET(){
  await dbConnect();
  const now = new Date();
  const candidates = await Popup.find({ active: true }).sort({ updatedAt: -1 }).lean();
  const doc = candidates.find(p => {
    const sOk = !p.startAt || new Date(p.startAt) <= now;
    const eOk = !p.endAt || new Date(p.endAt) >= now;
    return sOk && eOk;
  }) || null;
  return NextResponse.json({ ok:true, data: doc });
}
