export function formatJOD(value: number): string {
  return new Intl.NumberFormat("ar-JO", {
    style: "currency",
    currency: "JOD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ar-JO").format(value);
}
