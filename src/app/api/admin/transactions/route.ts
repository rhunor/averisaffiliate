import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;
    const type = searchParams.get("type") || "";

    await dbConnect();

    const query = type ? { type } : {};

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "firstName lastName email")
        .lean(),
      Transaction.countDocuments(query),
    ]);

    return NextResponse.json({ transactions, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[admin/transactions]", err);
    return NextResponse.json({ error: "Failed to load transactions." }, { status: 500 });
  }
}
