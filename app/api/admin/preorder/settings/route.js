import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import SiteSettings from "../../../../../models/SiteSettings";
async function ensureDB(){ await dbConnect(); }
export async function GET(){
  await ensureDB();
  let s = await SiteSettings.findOne({}, null, { sort: { createdAt: -1 } });
  if (!s) s = await SiteSettings.create({});
  return NextResponse.json({ ok:true, data:s });
}
export async function PUT(req){
  await ensureDB();
  const body = await req.json();
  let s = await SiteSettings.findOne({}, null, { sort: { createdAt: -1 } });
  if (!s) s = await SiteSettings.create({});
  const fields = [
    'preOrderEnabled','preOrderDefaultAdvancePercent','preOrderDefaultLeadTimeText',
    'bkashEnabled','bkashSandbox','bkashUsername','bkashPassword','bkashAppKey','bkashAppSecret',
    'uddoktaPayEnabled',
    'webhooks'
  ];
  for (const f of fields) if (f in body) s[f] = body[f];
  await s.save();
  return NextResponse.json({ ok:true, data:s });
}
