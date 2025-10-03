import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import Product from "../../../../../models/Product";
async function ensureDB(){ await dbConnect(); }
export async function GET(_req, { params }) {
  await ensureDB();
  const { id } = params || {};
  if (!id) return NextResponse.json({ ok:false, error:"Missing id" }, { status:400 });
  try {
    const p = await Product.findById(id).lean();
    if (!p) return NextResponse.json({ ok:false, error:"Not found" }, { status:404 });
    return NextResponse.json({ ok:true, product:p });
  } catch (e) {
    return NextResponse.json({ ok:false, error:e.message }, { status:400 });
  }
}
