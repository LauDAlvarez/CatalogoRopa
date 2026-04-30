import { normalizeText } from "@/lib/format";

function uniqueNormalized(values: string[]) {
  const seen = new Set<string>();

  return values.filter((value) => {
    const normalized = normalizeText(value);

    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });
}

export function splitProductColors(value?: string | null) {
  if (!value) {
    return [];
  }

  return uniqueNormalized(
    value
      .split(",")
      .map((color) => color.trim())
      .filter(Boolean)
  );
}

export function collectFacetColors(products: Array<{ predominantColor: string }>) {
  return uniqueNormalized(products.flatMap((product) => splitProductColors(product.predominantColor))).sort(
    (left, right) => left.localeCompare(right, "es-AR", { sensitivity: "base" })
  );
}

export function productMatchesColor(
  product: { predominantColor: string },
  selectedColor?: string
) {
  if (!selectedColor) {
    return true;
  }

  const normalizedSelectedColor = normalizeText(selectedColor);

  return splitProductColors(product.predominantColor).some(
    (color) => normalizeText(color) === normalizedSelectedColor
  );
}
