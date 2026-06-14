"use client";

import { useState } from "react";
import type { Category, Fitment, Part } from "@/lib/types";

interface PartFormProps {
  categories: Category[];
  initial?: Part | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  nameAr: string;
  name: string;
  partNumber: string;
  brand: string;
  description: string;
  price: string;
  quantity: string;
  minQuantity: string;
  branch: string;
  categoryId: string;
  fitments: Fitment[];
}

const BRANCHES = ["Amman", "Zarqa", "Irbid", "Aqaba"];

function buildInitialState(
  initial: Part | null | undefined,
  categories: Category[]
): FormState {
  return {
    nameAr: initial?.nameAr ?? "",
    name: initial?.name ?? "",
    partNumber: initial?.partNumber ?? "",
    brand: initial?.brand ?? "",
    description: initial?.description ?? "",
    price: initial ? String(initial.price) : "",
    quantity: initial ? String(initial.quantity) : "0",
    minQuantity: initial ? String(initial.minQuantity) : "5",
    branch: initial?.branch ?? "Amman",
    categoryId: initial
      ? String(initial.categoryId)
      : categories[0]
        ? String(categories[0].id)
        : "",
    fitments: initial?.fitments.map((f) => ({ ...f })) ?? [],
  };
}

export function PartForm({
  categories,
  initial,
  onClose,
  onSaved,
}: PartFormProps) {
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(initial, categories)
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(initial);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function addFitment() {
    const year = new Date().getFullYear();
    update("fitments", [
      ...form.fitments,
      { make: "", model: "", yearFrom: year, yearTo: year },
    ]);
  }

  function updateFitment(index: number, patch: Partial<Fitment>) {
    update(
      "fitments",
      form.fitments.map((f, i) => (i === index ? { ...f, ...patch } : f))
    );
  }

  function removeFitment(index: number) {
    update(
      "fitments",
      form.fitments.filter((_, i) => i !== index)
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      nameAr: form.nameAr,
      name: form.name || form.nameAr,
      partNumber: form.partNumber,
      brand: form.brand,
      description: form.description,
      price: Number(form.price),
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity),
      branch: form.branch,
      categoryId: Number(form.categoryId),
      fitments: form.fitments
        .filter((f) => f.make.trim() && f.model.trim())
        .map((f) => ({
          make: f.make,
          model: f.model,
          yearFrom: Number(f.yearFrom),
          yearTo: Number(f.yearTo),
        })),
    };

    const url = isEdit ? `/api/parts/${initial!.id}` : "/api/parts";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "حدث خطأ غير متوقع");
      return;
    }

    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4">
      <div className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? "تعديل قطعة" : "إضافة قطعة جديدة"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">اسم القطعة (عربي) *</label>
              <input
                className="input"
                value={form.nameAr}
                onChange={(e) => update("nameAr", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">اسم القطعة (إنجليزي)</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
              />
            </div>
            <div>
              <label className="label">رقم القطعة (OEM) *</label>
              <input
                className="input"
                value={form.partNumber}
                onChange={(e) => update("partNumber", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">الماركة *</label>
              <input
                className="input"
                value={form.brand}
                onChange={(e) => update("brand", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">الفئة *</label>
              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => update("categoryId", e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">الفرع</label>
              <select
                className="input"
                value={form.branch}
                onChange={(e) => update("branch", e.target.value)}
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">السعر (د.أ) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">الكمية *</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.quantity}
                onChange={(e) => update("quantity", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">الحد الأدنى للكمية</label>
              <input
                type="number"
                min="0"
                className="input"
                value={form.minQuantity}
                onChange={(e) => update("minQuantity", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">الوصف</label>
            <textarea
              className="input min-h-[70px]"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="label mb-0">التوافق مع المركبات</label>
              <button
                type="button"
                onClick={addFitment}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                + إضافة توافق
              </button>
            </div>
            <div className="space-y-2">
              {form.fitments.length === 0 && (
                <p className="text-xs text-slate-400">
                  لم تتم إضافة أي توافق بعد.
                </p>
              )}
              {form.fitments.map((fitment, index) => (
                <div
                  key={index}
                  className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2 sm:grid-cols-5"
                >
                  <input
                    className="input"
                    placeholder="الصنع"
                    value={fitment.make}
                    onChange={(e) =>
                      updateFitment(index, { make: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="الموديل"
                    value={fitment.model}
                    onChange={(e) =>
                      updateFitment(index, { model: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    className="input"
                    placeholder="من سنة"
                    value={fitment.yearFrom}
                    onChange={(e) =>
                      updateFitment(index, {
                        yearFrom: Number(e.target.value),
                      })
                    }
                  />
                  <input
                    type="number"
                    className="input"
                    placeholder="إلى سنة"
                    value={fitment.yearTo}
                    onChange={(e) =>
                      updateFitment(index, { yearTo: Number(e.target.value) })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeFitment(index)}
                    className="btn-danger"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              إلغاء
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "جارٍ الحفظ..." : "حفظ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
