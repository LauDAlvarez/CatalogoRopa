import { unstable_cache as cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  getCatalogDatasetFromStore,
  getHomeDataFromStore,
  getProductBySlugFromStore
} from "@/lib/dev-store";
import {
  mockHeroBanners,
  mockProducts,
  mockSecondaryBanners
} from "@/lib/mock-data";
import { filterCatalogProducts, normalizeCatalogFilters } from "@/lib/catalog-filters";
import { collectFacetColors } from "@/lib/product-colors";
import { buildSizeLabel, collectFacetSizes } from "@/lib/product-size";
import type {
  BannerData,
  CatalogFacets,
  CatalogFilters,
  ProductCardData
} from "@/lib/types";
import {
  parseCloudinaryImageAsset,
  parseCloudinaryImageAssets
} from "@/lib/cloudinary-images";
import { resolveUploadUrl, resolveUploadUrls } from "@/lib/uploads-config";

const HOME_REVALIDATE_SECONDS = 300;
const CATALOG_REVALIDATE_SECONDS = 300;
const CATALOG_DATASET_LIMIT = 120;
const FACETS_REVALIDATE_SECONDS = 900;

const bannerSelect = {
  id: true,
  title: true,
  titleColor: true,
  subtitle: true,
  subtitleColor: true,
  imageUrl: true,
  imageAsset: true,
  placement: true
};

const productCardSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  garmentType: true,
  gender: true,
  productModel: true,
  size: true,
  sizeFrom: true,
  sizeTo: true,
  isOneSize: true,
  predominantColor: true,
  price: true,
  imageUrl: true,
  imageUrls: true,
  imageAssets: true,
  createdAt: true,
  viewCount: true,
  inquiryCount: true
};

function extractImageUrls(
  imageAssets: unknown,
  imageUrls: unknown,
  imageUrl: string | null
) {
  const assets = parseCloudinaryImageAssets(imageAssets);

  if (assets.length) {
    return {
      imageAsset: assets[0] || null,
      imageAssets: assets,
      imageUrls: assets.map((asset) => asset.secureUrl)
    };
  }

  const urlsFromJson = Array.isArray(imageUrls)
    ? resolveUploadUrls(
        imageUrls.filter((value): value is string => typeof value === "string" && value.length > 0)
      )
    : [];

  if (urlsFromJson.length) {
    return {
      imageAsset: null,
      imageAssets: [],
      imageUrls: urlsFromJson
    };
  }

  const resolvedImageUrl = resolveUploadUrl(imageUrl);
  return {
    imageAsset: null,
    imageAssets: [],
    imageUrls: resolvedImageUrl ? [resolvedImageUrl] : []
  };
}

function mapProduct(product: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  garmentType: string;
  gender: ProductCardData["gender"];
  productModel: string | null;
  size: string;
  sizeFrom?: string | null;
  sizeTo?: string | null;
  isOneSize?: boolean;
  predominantColor: string;
  price: { toString(): string } | number | null;
  imageUrl: string | null;
  imageUrls?: unknown;
  imageAssets?: unknown;
  createdAt: Date;
  viewCount: number;
  inquiryCount: number;
}): ProductCardData {
  const { imageAsset, imageAssets, imageUrls } = extractImageUrls(
    product.imageAssets,
    product.imageUrls,
    product.imageUrl
  );
  const sizeFrom = product.sizeFrom || product.size || null;
  const isOneSize = Boolean(product.isOneSize);
  const sizeTo = isOneSize ? null : product.sizeTo || sizeFrom;

  return {
    ...product,
    size: sizeFrom
      ? buildSizeLabel({
          isOneSize,
          sizeFrom,
          sizeTo
        })
      : product.size,
    sizeFrom,
    sizeTo,
    isOneSize,
    imageAsset,
    imageAssets,
    imageUrl: imageUrls[0] || null,
    imageUrls,
    price: product.price === null ? null : Number(product.price.toString())
  };
}

function mapBanner(banner: {
  id: string;
  title: string;
  titleColor?: string | null;
  subtitle: string | null;
  subtitleColor?: string | null;
  imageUrl: string;
  imageAsset?: unknown;
  placement: BannerData["placement"];
}): BannerData {
  const imageAsset = parseCloudinaryImageAsset(banner.imageAsset);

  return {
    id: banner.id,
    title: banner.title,
    titleColor: banner.titleColor || null,
    subtitle: banner.subtitle,
    subtitleColor: banner.subtitleColor || null,
    imageUrl:
      imageAsset?.secureUrl ||
      resolveUploadUrl(banner.imageUrl) ||
      banner.imageUrl,
    imageAsset,
    placement: banner.placement
  };
}

function getMockFacets(products: ProductCardData[]): CatalogFacets {
  return {
    types: [...new Set(products.map((product) => product.garmentType))].sort(),
    genders: [...new Set(products.map((product) => product.gender))].sort(),
    sizes: collectFacetSizes(products),
    colors: collectFacetColors(products)
  };
}

function getMockHomeData() {
  return {
    heroBanners: mockHeroBanners,
    secondaryBanners: mockSecondaryBanners,
    recentProducts: [...mockProducts].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ),
    mostConsultedProducts: [...mockProducts].sort(
      (a, b) => (b.inquiryCount || 0) - (a.inquiryCount || 0)
    ),
    mostViewedProducts: [...mockProducts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
  };
}

const getCachedBannersByPlacement = cache(
  async (placement: BannerData["placement"]) => {
    if (!prisma) {
      throw new Error("Prisma no disponible");
    }

    const now = new Date();
    const activeBannerWindow = [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
    ];

    const banners = await prisma.banner.findMany({
      where: { placement, isActive: true, AND: activeBannerWindow },
      select: bannerSelect,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 8
    });

    return banners.map(mapBanner);
  },
  ["home-banners-by-placement"],
  { revalidate: HOME_REVALIDATE_SECONDS }
);

const getCachedProductsByRanking = cache(
  async (ranking: "recent" | "most-consulted" | "most-viewed") => {
    if (!prisma) {
      throw new Error("Prisma no disponible");
    }

    const orderBy =
      ranking === "recent"
        ? [{ createdAt: "desc" as const }]
        : ranking === "most-consulted"
          ? [{ inquiryCount: "desc" as const }, { createdAt: "desc" as const }]
          : [{ viewCount: "desc" as const }, { createdAt: "desc" as const }];

    const products = await prisma.product.findMany({
      where: { status: "ACTIVE", isAvailable: true },
      select: productCardSelect,
      orderBy,
      take: 8
    });

    return products.map(mapProduct);
  },
  ["home-products-by-ranking"],
  { revalidate: HOME_REVALIDATE_SECONDS }
);

const getCachedCatalogFacets = cache(
  async () => {
    if (!prisma) {
      throw new Error("Prisma no disponible");
    }

    const facetProducts = await prisma.product.findMany({
      where: { status: "ACTIVE", isAvailable: true },
      select: {
        garmentType: true,
        gender: true,
        size: true,
        sizeFrom: true,
        sizeTo: true,
        isOneSize: true,
        predominantColor: true
      }
    });

    return {
      types: [...new Set(facetProducts.map((product) => product.garmentType))].sort(),
      genders: [...new Set(facetProducts.map((product) => product.gender))].sort(),
      sizes: collectFacetSizes(facetProducts),
      colors: collectFacetColors(facetProducts)
    };
  },
  ["catalog-facets"],
  { revalidate: FACETS_REVALIDATE_SECONDS }
);

const getCachedCatalogDataset = cache(
  async () => {
    if (!prisma) {
      throw new Error("Prisma no disponible");
    }

    const products = await prisma.product.findMany({
      where: { status: "ACTIVE", isAvailable: true },
      select: productCardSelect,
      orderBy: { createdAt: "desc" },
      take: CATALOG_DATASET_LIMIT
    });

    return {
      products: products.map(mapProduct),
      facets: await getCachedCatalogFacets()
    };
  },
  ["catalog-dataset"],
  { revalidate: CATALOG_REVALIDATE_SECONDS }
);

export async function getHomeData() {
  const [heroBanners, secondaryBanners, recentProducts, mostConsultedProducts, mostViewedProducts] =
    await Promise.all([
      getHomeHeroBanners(),
      getHomeSecondaryBanners(),
      getHomeRecentProducts(),
      getHomeMostConsultedProducts(),
      getHomeMostViewedProducts()
    ]);

  return {
    heroBanners,
    secondaryBanners,
    recentProducts,
    mostConsultedProducts,
    mostViewedProducts
  };
}

export async function getHomePrimaryData() {
  const [heroBanners, recentProducts] = await Promise.all([
    getHomeHeroBanners(),
    getHomeRecentProducts()
  ]);

  return {
    heroBanners,
    recentProducts
  };
}

export async function getHomeHeroBanners() {
  if (prisma) {
    try {
      return await getCachedBannersByPlacement("HERO");
    } catch {
    }
  }

  try {
    return (await getHomeDataFromStore()).heroBanners;
  } catch {
    return getMockHomeData().heroBanners;
  }
}

export async function getHomeSecondaryBanners() {
  if (prisma) {
    try {
      return await getCachedBannersByPlacement("SECONDARY");
    } catch {
    }
  }

  try {
    return (await getHomeDataFromStore()).secondaryBanners;
  } catch {
    return getMockHomeData().secondaryBanners;
  }
}

export async function getHomeRecentProducts() {
  if (prisma) {
    try {
      return await getCachedProductsByRanking("recent");
    } catch {
    }
  }

  try {
    return (await getHomeDataFromStore()).recentProducts;
  } catch {
    return getMockHomeData().recentProducts;
  }
}

export async function getHomeMostConsultedProducts() {
  if (prisma) {
    try {
      return await getCachedProductsByRanking("most-consulted");
    } catch {
    }
  }

  try {
    return (await getHomeDataFromStore()).mostConsultedProducts;
  } catch {
    return getMockHomeData().mostConsultedProducts;
  }
}

export async function getHomeMostViewedProducts() {
  if (prisma) {
    try {
      return await getCachedProductsByRanking("most-viewed");
    } catch {
    }
  }

  try {
    return (await getHomeDataFromStore()).mostViewedProducts;
  } catch {
    return getMockHomeData().mostViewedProducts;
  }
}

export async function getCatalogProducts(filters: CatalogFilters) {
  const normalizedFilters = normalizeCatalogFilters(filters);

  try {
    const dataset = await getCatalogDataset();

    return {
      products: filterCatalogProducts(dataset.products, normalizedFilters).slice(0, 60),
      facets: dataset.facets
    };
  } catch {
    const filteredProducts = filterCatalogProducts(mockProducts, normalizedFilters);

    return {
      products: filteredProducts.slice(0, 60),
      facets: getMockFacets(mockProducts)
    };
  }
}

export async function getCatalogDataset() {
  if (prisma) {
    try {
      return await getCachedCatalogDataset();
    } catch {
    }
  }

  try {
    return await getCatalogDatasetFromStore();
  } catch {
    return {
      products: [...mockProducts]
        .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
        .slice(0, CATALOG_DATASET_LIMIT),
      facets: getMockFacets(mockProducts)
    };
  }
}

export async function getCatalogProductSlugs() {
  const { products } = await getCatalogDataset();
  return products.map((product) => product.slug);
}

export async function getProductBySlug(
  slug: string,
  options: { incrementView?: boolean } = { incrementView: true }
) {
  void options;

  try {
    const dataset = await getCatalogDataset();
    const product = dataset.products.find((item) => item.slug === slug);

    if (product) {
      return product;
    }
  } catch {
  }

  try {
    return await getProductBySlugFromStore(slug, options);
  } catch {
    return mockProducts.find((product) => product.slug === slug) ?? null;
  }
}

export async function incrementProductView(slug: string) {
  if (prisma) {
    try {
      const result = await prisma.product.updateMany({
        where: {
          slug,
          status: "ACTIVE",
          isAvailable: true
        },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });

      return result.count > 0;
    } catch {
    }
  }

  try {
    return Boolean(await getProductBySlugFromStore(slug, { incrementView: true }));
  } catch {
    return false;
  }
}
