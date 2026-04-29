import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { normalizeText } from "@/lib/format";
import { collectFacetSizes, productMatchesSize } from "@/lib/product-size";
import type { BannerData, CatalogFacets, CatalogFilters, ProductCardData } from "@/lib/types";

export const DEV_STORE_FILENAME = ".catalogo-dev-data.json";

type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
type BannerPlacement = "HERO" | "SECONDARY";
type ContactStatus = "NEW" | "READ" | "ARCHIVED";

type ProductRecord = ProductCardData & {
  description: string | null;
  productModel: string | null;
  price: number | null;
  imageUrl: string | null;
  imageUrls: string[];
  sizeFrom: string | null;
  sizeTo: string | null;
  isOneSize: boolean;
  isAvailable: boolean;
  status: ProductStatus;
  viewCount: number;
  inquiryCount: number;
  createdAt: string;
  updatedAt: string;
};

type BannerRecord = BannerData & {
  subtitle: string | null;
  targetUrl: string | null;
  placement: BannerPlacement;
  sortOrder: number;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ContactMessageRecord = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  comment: string;
  ipHash: string | null;
  userAgent: string | null;
  status: ContactStatus;
  createdAt: string;
};

type WhatsappSettingsRecord = {
  phone: string;
  message: string;
  updatedAt: string;
};

type StoreRecord = {
  products: ProductRecord[];
  banners: BannerRecord[];
  contactMessages: ContactMessageRecord[];
  whatsappSettings?: WhatsappSettingsRecord | null;
};

const storePath = path.resolve(process.cwd(), "..", DEV_STORE_FILENAME);

function emptyStore(): StoreRecord {
  return {
    products: [],
    banners: [],
    contactMessages: [],
    whatsappSettings: null
  };
}

async function ensureStoreFile() {
  try {
    await fs.access(storePath);
  } catch {
    await fs.writeFile(storePath, JSON.stringify(emptyStore(), null, 2), "utf8");
  }
}

async function readStore(): Promise<StoreRecord> {
  await ensureStoreFile();
  const raw = await fs.readFile(storePath, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<StoreRecord>;
    return {
      products: Array.isArray(parsed.products) ? parsed.products : [],
      banners: Array.isArray(parsed.banners) ? parsed.banners : [],
      contactMessages: Array.isArray(parsed.contactMessages) ? parsed.contactMessages : [],
      whatsappSettings:
        parsed.whatsappSettings &&
        typeof parsed.whatsappSettings === "object" &&
        typeof parsed.whatsappSettings.phone === "string" &&
        typeof parsed.whatsappSettings.message === "string"
          ? {
              phone: parsed.whatsappSettings.phone,
              message: parsed.whatsappSettings.message,
              updatedAt:
                typeof parsed.whatsappSettings.updatedAt === "string"
                  ? parsed.whatsappSettings.updatedAt
                  : new Date().toISOString()
            }
          : null
    };
  } catch {
    const fallback = emptyStore();
    await fs.writeFile(storePath, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
}

async function writeStore(store: StoreRecord) {
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

function mapProduct(record: ProductRecord): ProductCardData & {
  description: string | null;
  isAvailable: boolean;
  status: ProductStatus;
} {
  const imageUrls = Array.isArray(record.imageUrls)
    ? record.imageUrls.filter(Boolean)
    : record.imageUrl
      ? [record.imageUrl]
      : [];

  return {
    ...record,
    imageUrl: imageUrls[0] || null,
    imageUrls,
    sizeFrom: record.sizeFrom || record.size || null,
    sizeTo: record.isOneSize ? null : record.sizeTo || record.size || null,
    isOneSize: Boolean(record.isOneSize),
    createdAt: new Date(record.createdAt)
  };
}

function getFacets(products: ProductCardData[]): CatalogFacets {
  return {
    types: [...new Set(products.map((product) => product.garmentType))].sort(),
    genders: [...new Set(products.map((product) => product.gender))].sort(),
    sizes: collectFacetSizes(products),
    colors: [...new Set(products.map((product) => product.predominantColor))].sort()
  };
}

function filterProducts(products: ProductCardData[], filters: CatalogFilters) {
  const q = filters.q ? normalizeText(filters.q) : "";

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
      (!filters.type || product.garmentType === filters.type) &&
      (!filters.gender || product.gender === filters.gender) &&
      productMatchesSize(product, filters.size) &&
      (!filters.color || product.predominantColor === filters.color)
    );
  });
}

function bannerIsActive(
  banner: Pick<BannerRecord, "isActive" | "startsAt" | "endsAt">,
  now: Date
) {
  if (!banner.isActive) {
    return false;
  }

  const startsAt = banner.startsAt ? new Date(banner.startsAt) : null;
  const endsAt = banner.endsAt ? new Date(banner.endsAt) : null;

  if (startsAt && startsAt > now) {
    return false;
  }

  if (endsAt && endsAt < now) {
    return false;
  }

  return true;
}

export async function getHomeDataFromStore() {
  const store = await readStore();
  const now = new Date();
  const activeProducts = store.products
    .map(mapProduct)
    .filter((product) => product.status === "ACTIVE" && product.isAvailable);
  const activeBanners = store.banners.filter((banner) => bannerIsActive(banner, now));

  return {
    heroBanners: activeBanners
      .filter((banner) => banner.placement === "HERO")
      .sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8),
    secondaryBanners: activeBanners
      .filter((banner) => banner.placement === "SECONDARY")
      .sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8),
    recentProducts: [...activeProducts].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ),
    mostConsultedProducts: [...activeProducts].sort(
      (a, b) => (b.inquiryCount || 0) - (a.inquiryCount || 0)
    ),
    mostViewedProducts: [...activeProducts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
  };
}

export async function getCatalogProductsFromStore(filters: CatalogFilters) {
  const store = await readStore();
  const activeProducts = store.products
    .map(mapProduct)
    .filter((product) => product.status === "ACTIVE" && product.isAvailable);
  const filteredProducts = filterProducts(activeProducts, filters);

  return {
    products: filteredProducts
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 60),
    facets: getFacets(activeProducts)
  };
}

export async function getProductBySlugFromStore(
  slug: string,
  options: { incrementView?: boolean } = { incrementView: true }
) {
  const store = await readStore();
  const product = store.products.find((item) => item.slug === slug);

  if (!product || product.status !== "ACTIVE" || !product.isAvailable) {
    return null;
  }

  if (options.incrementView !== false) {
    store.products = store.products.map((item) =>
      item.id === product.id
        ? {
            ...item,
            viewCount: (item.viewCount || 0) + 1,
            updatedAt: new Date().toISOString()
          }
        : item
    );
    await writeStore(store);
  }

  return mapProduct(product);
}

export async function countRecentMessagesByIpHash(ipHash: string, since: Date) {
  const store = await readStore();
  return store.contactMessages.filter(
    (message) =>
      message.ipHash === ipHash && new Date(message.createdAt).getTime() >= since.getTime()
  ).length;
}

export async function createContactMessage(data: {
  firstName: string;
  lastName: string;
  email: string;
  comment: string;
  ipHash: string;
  userAgent: string | null;
}) {
  const store = await readStore();
  const message: ContactMessageRecord = {
    id: randomUUID(),
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    comment: data.comment,
    ipHash: data.ipHash,
    userAgent: data.userAgent,
    status: "NEW",
    createdAt: new Date().toISOString()
  };

  store.contactMessages.unshift(message);
  await writeStore(store);
  return message;
}

export async function getWhatsappSettingsFromStore() {
  const store = await readStore();
  return store.whatsappSettings || null;
}
