import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  if (!id) return NextResponse.json({ message: "Falta id" }, { status: 400 });

  await prisma.studentActividad.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
