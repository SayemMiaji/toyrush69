import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import SiteSettings from '@/models/SiteSettings';
export async function POST(req){
  await dbConnect();
  let { url, message } = await req.json().catch(()=>({}));
  const s = await SiteSettings.findOne({}).lean();
  const urls = url ? [url] : (s?.discordWebhooks || []);
  if(!urls.length) return NextResponse.json({ ok: false, error: 'No webhooks configured' }, { status: 400 });
  const payload = {
    content: message || '✅ Test webhook from Admin — connection looks good!'
  };
  const results = await Promise.allSettled(urls.map(async (u) => {
    const r = await fetch(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    return { url: u, ok: r.ok, status: r.status };
  }));
  return NextResponse.json({ ok: true, results });
}
