export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextResponse } from "next/server";
import { dbConnect } from "../../../../../../lib/db";
import Popup from "../../../../../../models/Popup";

export async function DELETE(req, { params }){
  await dbConnect();
  const id = params?.id;
  if (!id) return NextResponse.json({ ok:false, error:"Missing id" }, { status:400 });
  await Popup.findByIdAndDelete(id);
  return NextResponse.json({ ok:true });
}
