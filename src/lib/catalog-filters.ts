import { normalizeText } from "@/lib/format";
import { productMatchesColor } from "@/lib/product-colors";
import { productMatchesSize } from "@/lib/product-size";
import type { CatalogFilters, ProductCardData } from "@/lib/types";

const allowedGenders = new Set<ProductCardData["gender"]>([
  "MUJER",
  "HOMBRE",
  "UNISEX",
  "NINOS"
]);

function normalizeFilterValue(value: string | undefined, maxLength: number) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return undefined;
  }

  return trimmed.slice(0, maxLength);
}

export function normalizeCatalogFilters(filters: CatalogFilters): CatalogFilters {
  const gender = normalizeFilterValue(filters.gender, 20);

  return {
    q: normalizeFilterValue(filters.q, 80),
    type: normalizeFilterValue(filters.type, 80),
    gender: gender && allowedGenders.has(gender as ProductCardData["gender"]) ? gender : undefined,
    size: normalizeFilterValue(filters.size, 20),
    color: normalizeFilterValue(filters.color, 60)
  };
}

export function filterCatalogProducts(products: ProductCardData[], filters: CatalogFilters) {
  const normalizedFilters = normalizeCatalogFilters(filters);
  const q = normalizedFilters.q ? normalizeText(normalizedFilters.q) : "";

  return products.filter((product) => {
    const matchesSearch =
      !q ||
      normalizeText(
        [
          product.name,
          product.description,
          product.garmentType,
          product.productModel,
          product.predominantColor
        ]
          .filter(Boolean)
          .join(" ")
      ).includes(q);

    return (
      matchesSearch &&
      (!normalizedFilters.type || product.garmentType === normalizedFilters.type) &&
      (!normalizedFilters.gender || product.gender === normalizedFilters.gender) &&
      productMatchesSize(product, normalizedFilters.size) &&
      productMatchesColor(product, normalizedFilters.color)
    );
  });
}
