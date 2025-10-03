import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import DiscordConfig from '@/models/DiscordConfig';
import { sendDiscordPreorder } from '@/lib/discord';

export async function POST() {
  try {
    await dbConnect();
    const cfg = await DiscordConfig.findOne({}).lean();
    const webhookUrl = cfg?.webhookUrl || '';
    const dummy = {
      fullName: 'Test User',
      productName: 'Sample Product',
      productUrl: '',
      whatsapp: '+8801XXXXXXXXX',
      images: [],
      createdAt: Date.now()
    };
    const sent = await sendDiscordPreorder({ webhookUrl, request: dummy });
    if (!sent.ok) return NextResponse.json(sent, { status: 500 });
    return NextResponse.json({ ok:true });
  } catch (e) {
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}
