import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    const user = await User.findById(id);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    if (body.action === "toggle_special") {
      user.isSpecialAffiliate = !user.isSpecialAffiliate;
    }
    if (body.action === "toggle_active") {
      user.isActive = !user.isActive;
    }
    if (body.action === "set_role" && ["user", "admin"].includes(body.role)) {
      user.role = body.role;
    }

    await user.save();
    return NextResponse.json({ success: true, user: { id: user._id, isSpecialAffiliate: user.isSpecialAffiliate, isActive: user.isActive, role: user.role } });
  } catch (err) {
    console.error("[admin/users/id]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { id } = await params;
    await dbConnect();

    const user = await User.findById(id)
      .select("-passwordHash -emailVerificationToken -resetPasswordToken -twoFAOTP")
      .lean();

    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[admin/users/id GET]", err);
    return NextResponse.json({ error: "Failed." }, { status: 500 });
  }
}
