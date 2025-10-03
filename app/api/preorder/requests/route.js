import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import PreorderRequest from '@/models/PreorderRequest';
import DiscordConfig from '@/models/DiscordConfig';
import { sendDiscordPreorder } from '@/lib/discord';

export async function POST(req) {
  try {
    await dbConnect();
    const form = await req.formData();
    const fullName = form.get('fullName')?.toString().trim();
    const productName = form.get('productName')?.toString().trim();
    const productUrl = form.get('productUrl')?.toString().trim() || '';
    const whatsapp = form.get('whatsapp')?.toString().trim();
    const images = [];
    for (let i = 0; i < 4; i++) {
      const file = form.get('image' + i);
      if (file && typeof file === 'object') {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(new Uint8Array(arrayBuffer)).toString('base64');
        const mime = file.type || 'image/jpeg';
        images.push(`data:${mime};base64,${base64}`);
      }
    }
    if (!fullName || !productName || !whatsapp) {
      return NextResponse.json({ ok:false, error: 'Missing required fields' }, { status: 400 });
    }
    if (images.length < 1) {
      return NextResponse.json({ ok:false, error: 'At least one image is required' }, { status: 400 });
    }
    const doc = await PreorderRequest.create({
      fullName, productName, productUrl, whatsapp, images
    });
    try {
      const cfg = await DiscordConfig.findOne({}).lean();
      const webhookUrl = cfg?.webhookUrl || '';
      if (webhookUrl) {
        await sendDiscordPreorder({ webhookUrl, request: { ...doc.toObject?.() || {}, fullName, productName, productUrl, whatsapp, images, createdAt: Date.now() } });
      }
    } catch(err) { console.error('discord webhook send failed', err); }
    return NextResponse.json({ ok:true, data: { id: doc._id } }, { status: 201 });
  } catch (e) {
    console.error('preorder request create failed', e);
    return NextResponse.json({ ok:false, error: String(e?.message || e) }, { status: 500 });
  }
}
