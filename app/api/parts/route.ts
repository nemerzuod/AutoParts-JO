import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parsePartInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim();
  const categoryId = searchParams.get("categoryId");
  const lowStock = searchParams.get("lowStock") === "true";

  const where: Prisma.PartWhereInput = {};

  if (search) {
    where.OR = [
      { nameAr: { contains: search } },
      { name: { contains: search } },
      { partNumber: { contains: search } },
      { brand: { contains: search } },
      { fitments: { some: { model: { contains: search } } } },
      { fitments: { some: { make: { contains: search } } } },
    ];
  }

  if (categoryId && Number.isInteger(Number(categoryId))) {
    where.categoryId = Number(categoryId);
  }

  let parts = await prisma.part.findMany({
    where,
    include: { category: true, fitments: true },
    orderBy: { updatedAt: "desc" },
  });

  if (lowStock) {
    parts = parts.filter((p) => p.quantity <= p.minQuantity);
  }

  return NextResponse.json(parts);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = parsePartInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { fitments, ...data } = parsed.data;

  try {
    const part = await prisma.part.create({
      data: { ...data, fitments: { create: fitments } },
      include: { category: true, fitments: true },
    });
    return NextResponse.json(part, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "رقم القطعة مستخدم مسبقاً" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "تعذّر إنشاء القطعة" },
      { status: 500 }
    );
  }
}
