import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    await dbConnect();

    const settleBefore = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await Transaction.updateMany(
      { type: "commission", status: "pending", createdAt: { $lt: settleBefore } },
      { $set: { status: "completed" } }
    );

    const results = [
      result.modifiedCount > 0
        ? `✓ Settled ${result.modifiedCount} pending commission${result.modifiedCount === 1 ? "" : "s"} (older than 24 hours)`
        : "– No pending commissions older than 24 hours found",
      `  Cutoff: ${settleBefore.toLocaleString("en-NG", { timeZone: "Africa/Lagos" })} WAT`,
    ];

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("[admin/settle-commissions]", err);
    return NextResponse.json({ error: "Settlement failed." }, { status: 500 });
  }
}
