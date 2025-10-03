// app/api/products/route.js
import { NextResponse } from "next/server";
import { dbConnect } from "../../../lib/db";
import Product from "@/models/Product";
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const limitRaw = searchParams.get("limit");
    const limit = Math.min(Number(limitRaw) || 100, 200);
    const q = (searchParams.get("q") || "").trim();
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }
    const items = await Product
      .find(filter, {
        name: 1, title: 1, slug: 1, price: 1, regularPrice: 1, salePrice: 1,
        category: 1, images: 1, quantity: 1, soldOut: 1,
        isPreOrder: 1, preOrderAdvancePercent: 1, preOrderLeadTimeText: 1,
        ratingAvg: 1, ratingCount: 1,
        createdAt: 1, updatedAt: 1,
      })
      .select({ name:1, title:1, slug:1, price:1, regularPrice:1, salePrice:1, category:1, images:1, quantity:1, soldOut:1, isPreOrder:1, preOrderAdvancePercent:1, preOrderLeadTimeText:1, ratingAvg:1, ratingCount:1, description:1, videoUrl:1, createdAt:1, updatedAt:1 }).sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return NextResponse.json({ items });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}
