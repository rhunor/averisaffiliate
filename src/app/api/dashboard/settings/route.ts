import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { resolveAccount } from "@/lib/korapay";
import { sendBankDetailsChangedEmail } from "@/lib/email";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const sessionUser = session.user as unknown as Record<string, unknown>;
    await dbConnect();
    const user = await User.findById(sessionUser.id as string);
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

    const body = await req.json();
    const { action } = body;

    if (action === "update_bank") {
      const { bankCode, bankName, accountNumber } = body;
      if (!bankCode || !accountNumber) {
        return NextResponse.json({ error: "Bank and account number required." }, { status: 400 });
      }

      let accountName: string;
      try {
        const resolved = await resolveAccount(accountNumber, bankCode);
        accountName = resolved.accountName;
      } catch {
        return NextResponse.json({ error: "Could not verify bank account." }, { status: 400 });
      }

      user.bankDetails = { bankName: bankName || bankCode, bankCode, accountNumber, accountName };
      await user.save();

      await sendBankDetailsChangedEmail({
        email: user.email,
        firstName: user.firstName,
        bankName: bankName || bankCode,
        accountNumber,
        accountName,
      });

      return NextResponse.json({ success: true, bankDetails: user.bankDetails });
    }

    if (action === "change_password") {
      const { currentPassword, newPassword } = body;
      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: "Current and new password required." }, { status: 400 });
      }
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
      }

      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
      }

      user.passwordHash = await bcrypt.hash(newPassword, 12);
      user.knownDevices = [];
      await user.save();

      return NextResponse.json({ success: true });
    }

    if (action === "update_profile") {
      const { firstName, lastName } = body;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      await user.save();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("[settings]", err);
    return NextResponse.json({ error: "Settings update failed." }, { status: 500 });
  }
}
