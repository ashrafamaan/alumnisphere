import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/auth";

const LoginSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = LoginSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input data." },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        alumniProfile: true,
        studentProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // Create cryptographic session in database and set httpOnly cookie
    await createSession(user.id);

    const { passwordHash, ...sanitizedUser } = user;

    return NextResponse.json({
      success: true,
      user: sanitizedUser,
    });
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred during sign in." },
      { status: 500 }
    );
  }
}
