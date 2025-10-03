import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import DiscordConfig from '@/models/DiscordConfig';

export async function GET() {
  try {
    await dbConnect();
    const cfg = await DiscordConfig.findOne({}).lean();
    return NextResponse.json({ ok:true, data: cfg || { webhookUrl: '' } });
  } catch (e) {
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const url = (body?.webhookUrl || '').trim();
    const cfg = await DiscordConfig.findOne({});
    if (cfg) {
      cfg.webhookUrl = url;
      await cfg.save();
    } else {
      await DiscordConfig.create({ webhookUrl: url });
    }
    return NextResponse.json({ ok:true });
  } catch (e) {
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}
