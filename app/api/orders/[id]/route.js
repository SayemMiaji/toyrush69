import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import Order from "../../../../models/Order";
import Product from "../../../../models/Product";
async function ensureDB(){ await dbConnect(); }
function deepFindEmail(o, depth=0){
  if (!o || typeof o !== 'object' || depth > 3) return null;
  for (const [k,v] of Object.entries(o)){
    if (typeof v === 'string' && v.includes('@') && k.toLowerCase().includes('email')) return v;
    if (v && typeof v === 'object') {
      const f = deepFindEmail(v, depth+1);
      if (f) return f;
    }
  }
  return null;
}
export async function GET(req, ctx){
  await ensureDB();
  const ctxParams = (ctx?.params && typeof ctx.params.then === 'function') ? await ctx.params : ctx?.params;
  const { id } = ctxParams || {};
  if (!id) return NextResponse.json({ ok:false, error:"Missing id" }, { status:400 });
  const o = await Order.findById(id).lean();
  if (!o) return NextResponse.json({ ok:false, error:"Order not found" }, { status:404 });
  // Resolve product
  const slug = o.slug || o.productSlug || o.product?.slug || o.items?.[0]?.slug || o.items?.[0]?.product?.slug;
  const pid  = o.productId || o.product?._id || o.items?.[0]?.productId || o.items?.[0]?.product?._id;
  let product = null;
  if (slug) {
    product = await Product.findOne({ slug }, { title:1, name:1, images:1, slug:1 }).lean();
  } else if (pid) {
    try { product = await Product.findById(pid, { title:1, name:1, images:1, slug:1 }).lean(); } catch {}
  }
  // Normalize view fields
  const view = {
    email: o.email || o.customerEmail || o.contactEmail || deepFindEmail(o) || "",
    productName: o.productName || product?.title || product?.name || o.slug || o.productSlug || "",
    quantity: o.qty ?? o.quantity ?? o.items?.[0]?.qty ?? 1,
    image: product?.images?.[0] || null,
  };
  return NextResponse.json({ ok:true, data:o, view });
}
