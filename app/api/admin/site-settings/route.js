import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import SiteSettings from '@/models/SiteSettings';
export async function GET(){
  await dbConnect();
  let s = await SiteSettings.findOne({}).lean();
  if(!s){
    const created = await SiteSettings.create({});
    s = created.toObject();
  }
  return NextResponse.json({ settings: s });
}
export async function PUT(req){
  await dbConnect();
  const body = await req.json();
  let s = await SiteSettings.findOne({});
  if(!s){ s = new SiteSettings({}); }
  const fields = [
    'siteTitle','defaultDescription','defaultKeywords','ogImage',
    'twitterHandle','canonicalBase','gaMeasurementId','gtmContainerId',
    'analyticsEnabled','discordWebhooks',
    // Pre-order + bKash
    'preOrderEnabled','preOrderDefaultAdvancePercent','preOrderDefaultLeadTimeText','preOrderDisableCODNote',
    'bkashEnabled','bkashSandbox','bkashUsername','bkashPassword','bkashAppKey','bkashAppSecret'
  ];
  for(const k of fields){
    if(Object.prototype.hasOwnProperty.call(body, k)){
      s[k] = body[k];
    }
  }
  await s.save();
  return NextResponse.json({ settings: s });
}
