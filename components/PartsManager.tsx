"use client";

import { useCallback, useEffect, useState } from "react";
import type { Category, Part } from "@/lib/types";
import { formatJOD, formatNumber } from "@/lib/format";
import { PartForm } from "@/components/PartForm";

export function PartsManager() {
  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [lowStock, setLowStock] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Part | null>(null);

  const loadParts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (categoryId) params.set("categoryId", categoryId);
    if (lowStock) params.set("lowStock", "true");
    const res = await fetch(`/api/parts?${params.toString()}`);
    const data = await res.json();
    setParts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, categoryId, lowStock]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const timer = setTimeout(loadParts, 250);
    return () => clearTimeout(timer);
  }, [loadParts]);

  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(part: Part) {
    setEditing(part);
    setShowForm(true);
  }

  async function handleDelete(part: Part) {
    if (!window.confirm(`هل تريد حذف "${part.nameAr}"؟`)) return;
    const res = await fetch(`/api/parts/${part.id}`, { method: "DELETE" });
    if (res.ok) loadParts();
  }

  function handleSaved() {
    setShowForm(false);
    setEditing(null);
    loadParts();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">قطع الغيار</h1>
          <p className="text-sm text-slate-500">
            إدارة كتالوج قطع الغيار والمخزون
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + إضافة قطعة
        </button>
      </div>

      <div className="card flex flex-wrap items-center gap-3">
        <input
          className="input flex-1 min-w-[200px]"
          placeholder="ابحث بالاسم أو رقم القطعة أو الموديل..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input w-44"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">كل الفئات</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameAr}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300"
            checked={lowStock}
            onChange={(e) => setLowStock(e.target.checked)}
          />
          منخفض المخزون فقط
        </label>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400">
              <th className="px-4 py-3 font-medium">القطعة</th>
              <th className="px-4 py-3 font-medium">رقم القطعة</th>
              <th className="px-4 py-3 font-medium">الفئة</th>
              <th className="px-4 py-3 font-medium">التوافق</th>
              <th className="px-4 py-3 font-medium">السعر</th>
              <th className="px-4 py-3 font-medium">الكمية</th>
              <th className="px-4 py-3 font-medium">الفرع</th>
              <th className="px-4 py-3 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  جارٍ التحميل...
                </td>
              </tr>
            ) : parts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-slate-400">
                  لا توجد قطع مطابقة.
                </td>
              </tr>
            ) : (
              parts.map((part) => {
                const low = part.quantity <= part.minQuantity;
                return (
                  <tr
                    key={part.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">
                        {part.nameAr}
                      </p>
                      <p className="text-xs text-slate-400">{part.brand}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {part.partNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {part.category.nameAr}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {part.fitments.length === 0 ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {part.fitments.slice(0, 2).map((f, i) => (
                            <span
                              key={i}
                              className="badge bg-slate-100 text-slate-600"
                            >
                              {f.make} {f.model} ({f.yearFrom}-{f.yearTo})
                            </span>
                          ))}
                          {part.fitments.length > 2 && (
                            <span className="badge bg-slate-100 text-slate-500">
                              +{part.fitments.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatJOD(part.price)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          low
                            ? "bg-red-50 text-red-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {formatNumber(part.quantity)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{part.branch}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(part)}
                          className="btn-secondary px-3 py-1.5 text-xs"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(part)}
                          className="btn-danger px-3 py-1.5 text-xs"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <PartForm
          categories={categories}
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
