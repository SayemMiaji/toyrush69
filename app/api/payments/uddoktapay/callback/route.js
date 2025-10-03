import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
import Order from "../../../../../models/Order";
async function ensureDB(){ await dbConnect(); }
export async function GET(req){
  try{
    const url = new URL(req.url);
    const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (url.searchParams.get("cancel")) {
      const invoice = url.searchParams.get("invoice_id");
      try{
        await ensureDB();
        if (invoice) {
          await Order.updateMany(
            { uddoktaInvoiceId: invoice },
            { $set: { paymentStatus: "cancelled", paymentProvider: "uddoktapay" } }
          );
        }
      }catch{}
      return NextResponse.redirect(SITE + "/preorder-cancel");
    }
    const invoice_id = url.searchParams.get("invoice_id");
    if (!invoice_id) return NextResponse.redirect(SITE + "/preorder-success");
    const BASE   = process.env.UDDOKTAPAY_BASE_URL || "https://sandbox.uddoktapay.com";
    const APIKEY = process.env.UDDOKTAPAY_API_KEY || process.env.NEXT_PUBLIC_UDDOKTAPAY_API_KEY || "";
    const vr = await fetch(`${BASE}/api/verify-payment`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "RT-UDDOKTAPAY-API-KEY": APIKEY,
      },
      body: JSON.stringify({ invoice_id })
    });
    const data = await vr.json().catch(()=>({}));
    await ensureDB();
    let orderId = (data?.metadata?.order_id || data?.metadata?.orderId) || null;
    if (!orderId) {
      const byInv = await Order.findOne({ uddoktaInvoiceId: invoice_id }, { _id: 1 }).lean();
      if (byInv?._id) orderId = String(byInv._id);
    }
    if (orderId && data?.status === "COMPLETED") {
      await Order.updateOne(
        { _id: orderId },
        {
          $set: {
            paymentStatus: "paid",
            paymentProvider: "uddoktapay",
            transactionId: data?.transaction_id || data?.invoice_id || "",
            advanceAmount: Number(data?.charged_amount) || Number(data?.amount) || 0,
            uddoktaInvoiceId: data?.invoice_id || "",
            paymentMethod: data?.payment_method || "",
            senderNumber: data?.sender_number || ""
          },
          $unset: { paymentHoldUntil: 1 }
        }
      );
      return NextResponse.redirect(SITE + "/preorder-success?orderId=" + orderId);
    }
    if (orderId) {
      await Order.updateOne(
        { _id: orderId },
        { $set: { paymentStatus: "cancelled", paymentProvider: "uddoktapay" } }
      );
    }
    return NextResponse.redirect(SITE + "/preorder-cancel");
  }catch(e){
    const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.redirect(SITE + "/");
  }
}
