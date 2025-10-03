import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../../lib/db";
import Product from "../../../../../../models/Product";
async function ensureDB(){ await dbConnect(); }

export async function PUT(req) {
  await ensureDB();
  const url = req.nextUrl || new URL(req.url);
  const id = url.pathname.split("/").pop();
  const body = await req.json().catch(()=>({}));
  const allowed = ['isPreOrder','preOrderAdvancePercent','preOrderLeadTimeText'];
  const update = {};
  for (const k of allowed) if (k in body) update[k] = body[k];
  const p = await Product.findByIdAndUpdate(id, update, { new: true });
  if (!p) return NextResponse.json({ ok:false, error:'Product not found' }, { status:404 });
  return NextResponse.json({ ok:true, data:p });
}
