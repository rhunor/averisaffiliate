import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Withdrawal from "@/models/Withdrawal";
import "@/models/User"; // register User model so populate("userId") works

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 20;

    await dbConnect();

    const query = status === "all" ? {} : { status };

    const [withdrawals, total] = await Promise.all([
      Withdrawal.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "firstName lastName email referralCode")
        .lean(),
      Withdrawal.countDocuments(query),
    ]);

    return NextResponse.json({ withdrawals, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[admin/withdrawals]", err);
    return NextResponse.json({ error: "Failed to load withdrawals." }, { status: 500 });
  }
}
