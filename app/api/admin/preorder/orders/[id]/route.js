import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Order from "@/models/Order";

export async function PUT(req, { params }) {
  const { id } = params;
  await dbConnect();

  const body = await req.json();
  const set = {};
  const push = {};

  // Accept either `currentStatus` or `status` from the client
  const status =
    typeof body?.currentStatus === "string"
      ? body.currentStatus
      : typeof body?.status === "string"
      ? body.status
      : null;

  if (status) {
    set.currentStatus = status;
    // keep a history trail
    push.statusHistory = { status, at: new Date() };
  }

  // Optional toggles/fields
  if (typeof body.preOrderAdvancePaid !== "undefined") {
    const v = !!body.preOrderAdvancePaid;
    set.preOrderAdvancePaid = v;
    set.preOrderAdvancePaidAt = v ? new Date() : null;
  }
  if (typeof body.preOrderBalancePaid !== "undefined") {
    const v = !!body.preOrderBalancePaid;
    set.preOrderBalancePaid = v;
    set.preOrderBalancePaidAt = v ? new Date() : null;
  }
  if (typeof body.note === "string") {
    set.adminNote = body.note;
  }

  const update = {};
  if (Object.keys(set).length) update.$set = set;
  if (Object.keys(push).length) update.$push = push;

  const updated = await Order.findByIdAndUpdate(id, update, { new: true });
  return NextResponse.json({ ok: true, data: updated });
}
