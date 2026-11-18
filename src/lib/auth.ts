import crypto from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "alumni_session_token";
const SESSION_MAX_AGE_DAYS = 7;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      sessionToken: token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_DAYS * 24 * 60 * 60,
  });

  return session;
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: {
            alumniProfile: true,
            studentProfile: true,
          },
        },
      },
    });

    if (!session) return null;

    if (session.expiresAt < new Date()) {
      // Session expired -> cleanup
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }

    const { passwordHash, ...sanitizedUser } = session.user;
    return sanitizedUser;
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}

export async function destroySession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await prisma.session.delete({ where: { sessionToken: token } }).catch(() => {});
      cookieStore.delete(SESSION_COOKIE_NAME);
    }
  } catch (err) {
    console.error("destroySession error:", err);
  }
}
