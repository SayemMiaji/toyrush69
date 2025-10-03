import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../lib/db";
async function ensureDB(){ await dbConnect(); }
export async function POST(req) {
  await ensureDB();
  const { invoice_id } = await req.json();
  if (!invoice_id) return NextResponse.json({ ok:false, error:"invoice_id required" }, { status:400 });
  const s = await getSiteSettings();
  const UDDOKTAPAY_API_URL = process.env.UDDOKTAPAY_API_URL || "https://sandbox.uddoktapay.com";
  const UDDOKTAPAY_API_KEY = process.env.UDDOKTAPAY_UDDOKTAPAY_API_KEY;
  if (!UDDOKTAPAY_API_KEY) {
      return NextResponse.json({ ok:false, error:"Missing UDDOKTAPAY_UDDOKTAPAY_API_KEY in environment" }, { status: 500 });
    }
    try {
    const res = await fetch(`${UDDOKTAPAY_API_URL}/api/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "RT-UDDOKTAPAY-API-KEY": UDDOKTAPAY_API_KEY
      },
      body: JSON.stringify({ invoice_id })
    });
    const data = await res.json().catch(()=>({}));
    return NextResponse.json({ ok: res.ok, data }, { status: res.ok ? 200 : 400 });
  } catch (e) {
    return NextResponse.json({ ok:false, error:e.message }, { status: 500 });
  }
}
