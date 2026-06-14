import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatJOD, formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getStats() {
  const parts = await prisma.part.findMany({ include: { category: true } });
  const categoriesCount = await prisma.category.count();

  const totalParts = parts.length;
  const totalUnits = parts.reduce((sum, p) => sum + p.quantity, 0);
  const stockValue = parts.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const lowStock = parts
    .filter((p) => p.quantity <= p.minQuantity)
    .sort((a, b) => a.quantity - b.quantity);

  return { totalParts, totalUnits, stockValue, categoriesCount, lowStock };
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const { totalParts, totalUnits, stockValue, categoriesCount, lowStock } =
    await getStats();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">لوحة التحكم</h1>
          <p className="text-sm text-slate-500">
            نظرة عامة على مخزون قطع غيار السيارات
          </p>
        </div>
        <Link href="/parts" className="btn-primary">
          إدارة قطع الغيار
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="عدد القطع"
          value={formatNumber(totalParts)}
          accent="text-brand-700"
        />
        <StatCard
          label="إجمالي الوحدات بالمخزون"
          value={formatNumber(totalUnits)}
          accent="text-slate-800"
        />
        <StatCard
          label="قيمة المخزون"
          value={formatJOD(stockValue)}
          accent="text-emerald-600"
        />
        <StatCard
          label="الفئات"
          value={formatNumber(categoriesCount)}
          accent="text-slate-800"
        />
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            تنبيهات انخفاض المخزون
          </h2>
          <span className="badge bg-amber-50 text-amber-700">
            {formatNumber(lowStock.length)} قطعة
          </span>
        </div>

        {lowStock.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            لا توجد قطع منخفضة المخزون. كل شيء على ما يرام.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="py-2 font-medium">القطعة</th>
                  <th className="py-2 font-medium">رقم القطعة</th>
                  <th className="py-2 font-medium">الفئة</th>
                  <th className="py-2 font-medium">الكمية</th>
                  <th className="py-2 font-medium">الحد الأدنى</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((part) => (
                  <tr
                    key={part.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-2.5 font-medium text-slate-700">
                      {part.nameAr}
                    </td>
                    <td className="py-2.5 text-slate-500">{part.partNumber}</td>
                    <td className="py-2.5 text-slate-500">
                      {part.category.nameAr}
                    </td>
                    <td className="py-2.5">
                      <span className="badge bg-red-50 text-red-600">
                        {formatNumber(part.quantity)}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {formatNumber(part.minQuantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
