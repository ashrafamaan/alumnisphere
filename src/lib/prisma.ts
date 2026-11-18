import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  let dbUrl = process.env.DATABASE_URL || "file:./dev.db";

  // Check if running on Vercel or in serverless environment
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    const src = path.join(process.cwd(), "prisma", "dev.db");

    try {
      if (!fs.existsSync(tmpDbPath)) {
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, tmpDbPath);
          console.log(`[Vercel Serverless] Successfully copied seed DB to ${tmpDbPath}`);
        } else {
          console.warn("[Vercel Serverless] Seed database not found at", src);
        }
      }
      dbUrl = `file:${tmpDbPath}`;
    } catch (err) {
      console.error("[Vercel Serverless] Error initializing /tmp SQLite database:", err);
    }
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma = getPrismaClient();
