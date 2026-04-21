export function formatPrice(value?: number | string | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(numericValue)) {
    return null;
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(numericValue);
}

export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

