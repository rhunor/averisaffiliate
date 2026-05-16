import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }
    await dbConnect();
    const products = await Product.find().sort({ sortOrder: 1 }).lean();
    return NextResponse.json({ products });
  } catch (err) {
    console.error("[admin/products GET]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, price, renewalPrice, commissionAmount, renewalCommissionAmount, slug, sortOrder } = body;

    if (!name || !description || !price || !slug) {
      return NextResponse.json({ error: "name, description, price, and slug are required." }, { status: 400 });
    }

    await dbConnect();
    const product = await Product.create({
      name,
      description,
      price,
      renewalPrice: renewalPrice || price,
      commissionAmount: commissionAmount || Math.round(price * 0.5),
      renewalCommissionAmount: renewalCommissionAmount || Math.round((renewalPrice || price) * 0.5),
      slug,
      sortOrder: sortOrder || 0,
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err) {
    console.error("[admin/products POST]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
