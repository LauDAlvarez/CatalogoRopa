import { formatPrice, normalizeText } from "@/lib/format";
import { buildSizeLabel } from "@/lib/product-size";
import { siteConfig } from "@/lib/site-config";
import type { ProductCardData } from "@/lib/types";

export const DEFAULT_PRODUCT_WHATSAPP_MESSAGE =
  "Hola, quiero consultar por {{nombre}}. Tipo: {{tipo.producto}}. Modelo: {{tipo.modelo}}. Talle: {{talle}}. Color: {{color}}.";

type ProductWhatsappTemplateInput = Pick<
  ProductCardData,
  | "name"
  | "slug"
  | "description"
  | "garmentType"
  | "gender"
  | "productModel"
  | "size"
  | "sizeFrom"
  | "sizeTo"
  | "isOneSize"
  | "predominantColor"
  | "price"
>;

export function buildWhatsappUrl(phoneValue: string, messageValue: string) {
  const phone = phoneValue.replace(/\D/g, "");

  if (!phone) {
    return null;
  }

  const message = messageValue.trim();
  const query = message ? `?text=${encodeURIComponent(message)}` : "";

  return `https://wa.me/${phone}${query}`;
}

export function getProductStockLabel(product: ProductWhatsappTemplateInput) {
  if (product.isOneSize) {
    return `Talle unico en ${product.sizeFrom || product.size}`;
  }

  return product.sizeFrom && product.sizeTo && product.sizeFrom !== product.sizeTo
    ? `Stock disponible del ${product.sizeFrom} al ${product.sizeTo}`
    : `Stock disponible en ${product.size}`;
}

function normalizeTokenName(value: string) {
  return normalizeText(value).replace(/[^a-z0-9]/g, "");
}

function getProductTemplateValues(product: ProductWhatsappTemplateInput) {
  const sizeFrom = product.sizeFrom?.trim() || product.size.trim();
  const sizeTo = product.isOneSize ? null : product.sizeTo?.trim() || sizeFrom;
  const sizeLabel = sizeFrom
    ? buildSizeLabel({
        isOneSize: Boolean(product.isOneSize),
        sizeFrom,
        sizeTo
      })
    : product.size;
  const price = formatPrice(product.price);
  const productUrl = `${siteConfig.siteUrl.replace(/\/$/, "")}/catalogo/${product.slug}`;

  return {
    nombre: product.name,
    producto: product.garmentType,
    tipoproducto: product.garmentType,
    tipo: product.garmentType,
    modeloproducto: product.productModel?.trim() || product.name,
    tipomodelo: product.productModel?.trim() || product.name,
    modelo: product.productModel?.trim() || product.name,
    genero: product.gender,
    talle: sizeLabel,
    colordominante: product.predominantColor,
    color: product.predominantColor,
    precio: price || "",
    descripcion: product.description?.trim() || "",
    stock: getProductStockLabel(product),
    url: productUrl,
    link: productUrl
  } satisfies Record<string, string>;
}

export function renderProductWhatsappMessage(
  template: string,
  product: ProductWhatsappTemplateInput
) {
  const baseTemplate = template.trim() || DEFAULT_PRODUCT_WHATSAPP_MESSAGE;
  const values = getProductTemplateValues(product);

  return baseTemplate
    .replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, rawToken) => {
      const token = normalizeTokenName(rawToken);
      return token in values ? values[token as keyof typeof values] : match;
    })
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
