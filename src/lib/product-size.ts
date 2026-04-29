import type { ProductCardData } from "@/lib/types";

type ProductSizeShape = Pick<ProductCardData, "size" | "sizeFrom" | "sizeTo" | "isOneSize">;

export const SIZE_OPTIONS = [
  "XXXS",
  "XXS",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "4",
  "6",
  "8",
  "10",
  "12",
  "14",
  "16",
  "18",
  "20"
] as const;

export type ProductSizeOption = (typeof SIZE_OPTIONS)[number];

export function isValidSizeOption(value: string): value is ProductSizeOption {
  return SIZE_OPTIONS.includes(value as ProductSizeOption);
}

export function compareSizeOptions(a: string, b: string) {
  return SIZE_OPTIONS.indexOf(a as ProductSizeOption) - SIZE_OPTIONS.indexOf(b as ProductSizeOption);
}

export function buildSizeLabel(input: {
  isOneSize: boolean;
  sizeFrom: string;
  sizeTo?: string | null;
}) {
  if (input.isOneSize) {
    return `Talle unico (${input.sizeFrom})`;
  }

  return input.sizeFrom === input.sizeTo || !input.sizeTo
    ? input.sizeFrom
    : `${input.sizeFrom} a ${input.sizeTo}`;
}

export function expandProductSizes(product: ProductSizeShape) {
  const fallbackSize = product.size?.trim();
  const sizeFrom = product.sizeFrom?.trim() || fallbackSize || "";
  const sizeTo = product.isOneSize ? sizeFrom : product.sizeTo?.trim() || sizeFrom;

  if (!sizeFrom) {
    return [];
  }

  if (!isValidSizeOption(sizeFrom) || !isValidSizeOption(sizeTo)) {
    return fallbackSize ? [fallbackSize] : [];
  }

  if (compareSizeOptions(sizeFrom, sizeTo) > 0) {
    return fallbackSize ? [fallbackSize] : [sizeFrom];
  }

  const startIndex = SIZE_OPTIONS.indexOf(sizeFrom);
  const endIndex = SIZE_OPTIONS.indexOf(sizeTo);

  return SIZE_OPTIONS.slice(startIndex, endIndex + 1);
}

export function productMatchesSize(product: ProductSizeShape, requestedSize?: string) {
  if (!requestedSize) {
    return true;
  }

  return expandProductSizes(product).includes(requestedSize as ProductSizeOption);
}

export function collectFacetSizes(products: ProductSizeShape[]) {
  const sizeSet = new Set<string>();

  for (const product of products) {
    for (const size of expandProductSizes(product)) {
      sizeSet.add(size);
    }
  }

  return [...sizeSet].sort((left, right) => compareSizeOptions(left, right));
}
