import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/db";
import SiteSettings from "../../../../models/SiteSettings";
async function ensureDB(){ await dbConnect(); }
export async function GET() {
  await ensureDB();
  const s = await SiteSettings.findOne({}, null, { sort: { createdAt: -1 } }).lean();
  const safe = s ? {
    preOrderEnabled: !!s.preOrderEnabled,
    preOrderDefaultAdvancePercent: s.preOrderDefaultAdvancePercent ?? 50,
    preOrderDefaultLeadTimeText: s.preOrderDefaultLeadTimeText || '',
    preOrderDisableCODNote: s.preOrderDisableCODNote || '',
    bkashEnabled: !!s.bkashEnabled,
    bkashSandbox: s.bkashSandbox !== false,
    uddoktaPayEnabled: !!s.uddoktaPayEnabled
  } : {
    preOrderEnabled: true,
    preOrderDefaultAdvancePercent: 50,
    preOrderDefaultLeadTimeText: 'It will take up to 14–20 working days to arrive at your door step after pre‑ordering.',
    preOrderDisableCODNote: 'Full COD is not available for pre‑orders. Please pay the advance using bKash.',
    bkashEnabled: false,
    bkashSandbox: true,
    uddoktaPayEnabled: false
  };
  return NextResponse.json({ ok: true, data: safe });
}
