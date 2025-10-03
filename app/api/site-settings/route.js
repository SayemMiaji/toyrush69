import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/db";
import SiteSettings from '@/models/SiteSettings'
export async function GET(){
  await dbConnect()
  const s = await SiteSettings.findOne({}).lean()
  const safe = s ? {
    preOrderEnabled: !!s.preOrderEnabled,
    preOrderDefaultAdvancePercent: s.preOrderDefaultAdvancePercent ?? 50,
    preOrderDefaultLeadTimeText: s.preOrderDefaultLeadTimeText || '',
    preOrderDisableCODNote: s.preOrderDisableCODNote || '',
    bkashEnabled: !!s.bkashEnabled,
    bkashSandbox: s.bkashSandbox !== false,
  } : {
    preOrderEnabled: true,
    preOrderDefaultAdvancePercent: 50,
    preOrderDefaultLeadTimeText: 'It will take up to 14–20 working days to arrive at your door step after pre‑ordering.',
    preOrderDisableCODNote: 'Full COD is not available for pre‑orders. Please pay the advance using bKash.',
    bkashEnabled: false,
    bkashSandbox: true,
  }
  return NextResponse.json({ settings: safe })
}
