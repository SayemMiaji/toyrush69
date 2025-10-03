// Backward-compatible + new-format POST handler
import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
export async function POST(req){
  try{
    await dbConnect();
    const body = await req.json().catch(()=>({}));
    // --- Legacy contract (OLD working version) ---
    if (body?.slug){
      const {
        slug, qty = 1,
        name, phone, email, address, city,
        delivery = "inside",
        subtotal, deliveryFee, total,
        preOrderAdvancePercent = 50,
        advanceAmount = 0,
        dueOnDelivery = 0,
        paymentMethod = "bkash"
      } = body;
      if (!slug) return NextResponse.json({ ok:false, error: "Missing product slug" }, { status: 400 });
      if (!phone) return NextResponse.json({ ok:false, error: "Phone is required" }, { status: 400 });
      const product = await Product.findOne({ slug }).lean();
      if (!product) return NextResponse.json({ ok:false, error: "Product not found" }, { status: 404 });
      const computedSubtotal = Number(subtotal ?? (Number(product?.price || 0) * Number(qty || 1)));
      const computedDelivery = Number(deliveryFee ?? 0);
      const computedTotal = Number(total ?? (computedSubtotal + computedDelivery));
      const order = await Order.create({
        items: [{
          productId: product._id,
          name: product.name,
          price: Number(product.price || 0),
          qty: Number(qty || 1),
          slug: product.slug
        }],
        name, phone, email,
        address, city,
        delivery,
        subtotal: computedSubtotal,
        deliveryFee: computedDelivery,
        total: computedTotal,
        payment: paymentMethod,
        isPreOrder: true,
        preOrderAdvancePercent: Number(preOrderAdvancePercent) || 50,
        advanceAmount: Number(advanceAmount) || 0,
        dueOnDelivery: Number(dueOnDelivery) || 0,
        preOrderNote: product?.preOrderLeadTimeText || "",
        currentStatus: "Placed"
      });
      return NextResponse.json({ ok: true, id: order._id });
    }
    // --- Newer flexible format ---
    const {
      items = [],
      customer = {},
      advanceDue = 0,
      isPreorder,
      isPreOrder,
      metadata = {},
      payment = {},
      subtotal: sub2,
      deliveryFee: del2,
      total: tot2,
      paymentProvider,
      paymentMethod,
      transactionId
    } = body;
    const name = customer?.name ?? body?.name ?? null;
    const phone = customer?.phone ?? body?.phone ?? null;
    const email = customer?.email ?? body?.email ?? null;
    const address = customer?.address ?? body?.address ?? null;
    const city = customer?.city ?? body?.city ?? null;
    const isPreOrderFlag = (isPreOrder ?? isPreorder ?? true) ? true : false;
    if (!phone) return NextResponse.json({ ok:false, error: "Phone is required" }, { status: 400 });
    // if items were sent as [{slug,...}] but not productId/price, try to enrich from Product
    let normItems = Array.isArray(items) ? [...items] : [];
    for (let i=0;i<normItems.length;i++){
      const it = normItems[i] || {};
      if (!it.price || !it.name){
        if (it.slug){
          const p = await Product.findOne({ slug: it.slug }).lean();
          if (p){
            normItems[i] = {
              productId: p._id,
              name: p.name,
              price: Number(p.price || it.price || 0),
              qty: Number(it.qty || 1),
              slug: p.slug
            };
          }
        }
      }
      normItems[i].qty = Number(normItems[i].qty || 1);
      normItems[i].price = Number(normItems[i].price || 0);
    }
    const order = await Order.create({
      items: normItems,
      name, phone, email,
      address, city,
      isPreOrder: isPreOrderFlag,
      preOrderAdvanceAmount: Number(advanceDue || 0),
      subtotal: sub2 ?? undefined,
      deliveryFee: del2 ?? undefined,
      total: tot2 ?? undefined,
      paymentProvider: payment?.provider ?? paymentProvider ?? undefined,
      paymentMethod: payment?.method ?? paymentMethod ?? undefined,
      transactionId: payment?.transaction_id ?? transactionId ?? undefined,
      metadata
    });
    return NextResponse.json({ ok: true, orderId: String(order._id) });
  }catch(err){
    console.error("POST /api/preorders error", err);
    return NextResponse.json({ ok:false, error: String(err?.message || err) }, { status: 500 });
  }
}
