import { NextResponse } from "next/server";
import { sendAdminWebhooks } from "../../../../../../lib/webhooks";

export async function POST() {
  await sendAdminWebhooks('preorder.webhook.test', { timestamp: Date.now() });
  return NextResponse.json({ ok:true });
}
