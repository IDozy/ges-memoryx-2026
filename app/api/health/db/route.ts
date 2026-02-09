import { prisma } from "@/src/shared/db/prisma";
import { NextResponse } from "next/server";


export async function GET() {
  await prisma.$queryRaw`SELECT 1`;
  return NextResponse.json({ ok: true });
}
