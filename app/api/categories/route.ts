import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { parts: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (
    !body ||
    typeof body.name !== "string" ||
    typeof body.nameAr !== "string" ||
    !body.name.trim() ||
    !body.nameAr.trim()
  ) {
    return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({
      data: { name: body.name.trim(), nameAr: body.nameAr.trim() },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "الفئة موجودة مسبقاً" },
      { status: 409 }
    );
  }
}
