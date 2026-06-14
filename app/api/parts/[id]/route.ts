import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parsePartInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

function parseId(params: { id: string }): number | null {
  const id = Number(params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseId(params);
  if (id === null) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  const part = await prisma.part.findUnique({
    where: { id },
    include: { category: true, fitments: true },
  });

  if (!part) {
    return NextResponse.json({ error: "القطعة غير موجودة" }, { status: 404 });
  }

  return NextResponse.json(part);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseId(params);
  if (id === null) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = parsePartInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { fitments, ...data } = parsed.data;

  try {
    const part = await prisma.$transaction(async (tx) => {
      await tx.vehicleFitment.deleteMany({ where: { partId: id } });
      return tx.part.update({
        where: { id },
        data: { ...data, fitments: { create: fitments } },
        include: { category: true, fitments: true },
      });
    });
    return NextResponse.json(part);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "رقم القطعة مستخدم مسبقاً" },
          { status: 409 }
        );
      }
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "القطعة غير موجودة" },
          { status: 404 }
        );
      }
    }
    return NextResponse.json({ error: "تعذّر تحديث القطعة" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseId(params);
  if (id === null) {
    return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
  }

  try {
    await prisma.part.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "القطعة غير موجودة" }, { status: 404 });
  }
}
