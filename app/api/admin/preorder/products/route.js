import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import Product from "../../../../../models/Product";
async function ensureDB(){ await dbConnect(); }
export async function GET() {
  await ensureDB();
  const products = await Product.find({}, { title:1, name:1, images:1, price:1, slug:1, isPreOrder:1, preOrderAdvancePercent:1, preOrderLeadTimeText:1 }).sort({ createdAt: -1 });
  return NextResponse.json({ ok:true, data: products });
}
