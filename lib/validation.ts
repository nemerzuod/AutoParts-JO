export interface FitmentInput {
  make: string;
  model: string;
  yearFrom: number;
  yearTo: number;
}

export interface PartInput {
  name: string;
  nameAr: string;
  partNumber: string;
  brand: string;
  description: string | null;
  price: number;
  quantity: number;
  minQuantity: number;
  branch: string;
  categoryId: number;
  fitments: FitmentInput[];
}

export type ValidationResult =
  | { ok: true; data: PartInput }
  | { ok: false; error: string };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parsePartInput(body: unknown): ValidationResult {
  if (!isObject(body)) {
    return { ok: false, error: "Invalid request body" };
  }

  const nameAr = typeof body.nameAr === "string" ? body.nameAr.trim() : "";
  const partNumber =
    typeof body.partNumber === "string" ? body.partNumber.trim() : "";
  const brand = typeof body.brand === "string" ? body.brand.trim() : "";

  if (!nameAr) return { ok: false, error: "اسم القطعة (بالعربية) مطلوب" };
  if (!partNumber) return { ok: false, error: "رقم القطعة مطلوب" };
  if (!brand) return { ok: false, error: "الماركة مطلوبة" };

  const categoryId = Number(body.categoryId);
  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return { ok: false, error: "الفئة مطلوبة" };
  }

  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: "السعر غير صالح" };
  }

  const quantity = Number(body.quantity);
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { ok: false, error: "الكمية غير صالحة" };
  }

  const minQuantity = Number(body.minQuantity ?? 5);
  if (!Number.isInteger(minQuantity) || minQuantity < 0) {
    return { ok: false, error: "الحد الأدنى للكمية غير صالح" };
  }

  const name =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : nameAr;
  const branch =
    typeof body.branch === "string" && body.branch.trim()
      ? body.branch.trim()
      : "Amman";
  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;

  const fitments: FitmentInput[] = [];
  if (Array.isArray(body.fitments)) {
    for (const raw of body.fitments) {
      if (!isObject(raw)) continue;
      const make = typeof raw.make === "string" ? raw.make.trim() : "";
      const model = typeof raw.model === "string" ? raw.model.trim() : "";
      const yearFrom = Number(raw.yearFrom);
      const yearTo = Number(raw.yearTo);
      if (!make || !model) continue;
      if (!Number.isInteger(yearFrom) || !Number.isInteger(yearTo)) continue;
      fitments.push({
        make,
        model,
        yearFrom,
        yearTo: yearTo < yearFrom ? yearFrom : yearTo,
      });
    }
  }

  return {
    ok: true,
    data: {
      name,
      nameAr,
      partNumber,
      brand,
      description,
      price,
      quantity,
      minQuantity,
      branch,
      categoryId,
      fitments,
    },
  };
}
