import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import { siteConfig } from "@/config/site";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const sessionUser = session.user as unknown as Record<string, unknown>;
    const referralCode = sessionUser.referralCode as string;

    await dbConnect();
    const products = await Product.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const productsWithLinks = products.map((p) => ({
      ...p,
      referralLink: `${appUrl}/register?ref=${referralCode}&product=${(p as Record<string, unknown>).slug}`,
    }));

    return NextResponse.json({ products: productsWithLinks });
  } catch (err) {
    console.error("[products]", err);
    return NextResponse.json({ error: "Failed to load products." }, { status: 500 });
  }
}
