import { prisma } from "@/lib/prisma";
import {
  getCatalogProductsFromStore,
  getHomeDataFromStore,
  getProductBySlugFromStore
} from "@/lib/dev-store";
import { normalizeText } from "@/lib/format";
import {
  mockHeroBanners,
  mockProducts,
  mockSecondaryBanners
} from "@/lib/mock-data";
import { buildSizeLabel, collectFacetSizes, productMatchesSize } from "@/lib/product-size";
import type {
  BannerData,
  CatalogFacets,
  CatalogFilters,
  ProductCardData
} from "@/lib/types";

function extractImageUrls(imageUrls: unknown, imageUrl: string | null) {
  const urlsFromJson = Array.isArray(imageUrls)
    ? imageUrls.filter((value): value is string => typeof value === "string" && value.length > 0)
    : [];

  if (urlsFromJson.length) {
    return urlsFromJson;
  }

  return imageUrl ? [imageUrl] : [];
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
  createdAt: Date;
  viewCount: number;
  inquiryCount: number;
}): ProductCardData {
  const imageUrls = extractImageUrls(product.imageUrls, product.imageUrl);
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
    imageUrl: imageUrls[0] || null,
    imageUrls,
    price: product.price === null ? null : Number(product.price.toString())
  };
}

function mapBanner(banner: {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  placement: BannerData["placement"];
}): BannerData {
  return {
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    imageUrl: banner.imageUrl,
    placement: banner.placement
  };
}

function getMockFacets(products: ProductCardData[]): CatalogFacets {
  return {
    types: [...new Set(products.map((product) => product.garmentType))].sort(),
    genders: [...new Set(products.map((product) => product.gender))].sort(),
    sizes: collectFacetSizes(products),
    colors: [...new Set(products.map((product) => product.predominantColor))].sort()
  };
}

function filterMockProducts(filters: CatalogFilters) {
  const q = filters.q ? normalizeText(filters.q) : "";

  return mockProducts.filter((product) => {
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

export async function getHomeData() {
  if (!prisma) {
    try {
      return await getHomeDataFromStore();
    } catch {
      return {
        heroBanners: mockHeroBanners,
        secondaryBanners: mockSecondaryBanners,
        recentProducts: [...mockProducts].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        ),
        mostConsultedProducts: [...mockProducts].sort(
          (a, b) => (b.inquiryCount || 0) - (a.inquiryCount || 0)
        ),
        mostViewedProducts: [...mockProducts].sort(
          (a, b) => (b.viewCount || 0) - (a.viewCount || 0)
        )
      };
    }
  }

  const now = new Date();
  const activeBannerWindow = [
    { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
    { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }
  ];

  const [heroBanners, secondaryBanners, recentProducts, mostConsultedProducts, mostViewedProducts] =
    await Promise.all([
      prisma.banner.findMany({
        where: { placement: "HERO", isActive: true, AND: activeBannerWindow },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 8
      }),
      prisma.banner.findMany({
        where: { placement: "SECONDARY", isActive: true, AND: activeBannerWindow },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        take: 8
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isAvailable: true },
        orderBy: { createdAt: "desc" },
        take: 8
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isAvailable: true },
        orderBy: { inquiryCount: "desc" },
        take: 8
      }),
      prisma.product.findMany({
        where: { status: "ACTIVE", isAvailable: true },
        orderBy: { viewCount: "desc" },
        take: 8
      })
    ]);

  return {
    heroBanners: heroBanners.map(mapBanner),
    secondaryBanners: secondaryBanners.map(mapBanner),
    recentProducts: recentProducts.map(mapProduct),
    mostConsultedProducts: mostConsultedProducts.map(mapProduct),
    mostViewedProducts: mostViewedProducts.map(mapProduct)
  };
}

export async function getCatalogProducts(filters: CatalogFilters) {
  if (!prisma) {
    try {
      return await getCatalogProductsFromStore(filters);
    } catch {
      const filteredProducts = filterMockProducts(filters);

      return {
        products: filteredProducts,
        facets: getMockFacets(mockProducts)
      };
    }
  }

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      isAvailable: true,
      ...(filters.type ? { garmentType: filters.type } : {}),
      ...(filters.gender ? { gender: filters.gender as ProductCardData["gender"] } : {}),
      ...(filters.color ? { predominantColor: filters.color } : {}),
      ...(filters.q
        ? {
            OR: [
              { name: { contains: filters.q } },
              { description: { contains: filters.q } },
              { garmentType: { contains: filters.q } },
              { productModel: { contains: filters.q } },
              { predominantColor: { contains: filters.q } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: "desc" },
    take: 120
  });

  const activeProducts = products.map(mapProduct);
  const filteredProducts = activeProducts.filter((product) => productMatchesSize(product, filters.size));
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
    products: filteredProducts.slice(0, 60),
    facets: {
      types: [...new Set(facetProducts.map((product) => product.garmentType))].sort(),
      genders: [...new Set(facetProducts.map((product) => product.gender))].sort(),
      sizes: collectFacetSizes(facetProducts),
      colors: [...new Set(facetProducts.map((product) => product.predominantColor))].sort()
    }
  };
}

export async function getProductBySlug(
  slug: string,
  options: { incrementView?: boolean } = { incrementView: true }
) {
  if (!prisma) {
    try {
      return await getProductBySlugFromStore(slug, options);
    } catch {
      return mockProducts.find((product) => product.slug === slug) ?? null;
    }
  }

  const product = await prisma.product.findUnique({
    where: { slug }
  });

  if (!product || product.status !== "ACTIVE" || !product.isAvailable) {
    return null;
  }

  if (options.incrementView !== false) {
    prisma.product
      .update({
        where: { id: product.id },
        data: { viewCount: { increment: 1 } }
      })
      .catch(() => undefined);
  }

  return mapProduct(product);
}
