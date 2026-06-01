import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { generateReferralCode, generateSecureToken } from "@/lib/utils";
import { sendVerificationEmail } from "@/lib/email";
import { registerSchema } from "@/schemas/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        errors[i.path[0] as string] = i.message;
      });
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { firstName, lastName, email, password, referralCode, productSlug } = parsed.data;
    await dbConnect();

    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    let referredByUser = null;
    if (referralCode) {
      referredByUser = await User.findOne({ referralCode });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const newReferralCode = await generateUniqueReferralCode();
    const verificationToken = generateSecureToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      firstName,
      lastName,
      email,
      passwordHash,
      referralCode: newReferralCode,
      referredBy: referredByUser?._id || null,
      signupProductSlug: productSlug || null,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    });

    await sendVerificationEmail(email, firstName, verificationToken);

    return NextResponse.json({ success: true, userId: user._id.toString() }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}

async function generateUniqueReferralCode(): Promise<string> {
  let code: string;
  let exists = true;
  do {
    code = generateReferralCode("AVR");
    exists = !!(await User.findOne({ referralCode: code }));
  } while (exists);
  return code;
}
