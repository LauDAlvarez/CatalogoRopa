import { prisma } from "@/lib/prisma";
import { normalizeText } from "@/lib/format";
import {
  mockHeroBanners,
  mockProducts,
  mockSecondaryBanners
} from "@/lib/mock-data";
import type {
  BannerData,
  CatalogFacets,
  CatalogFilters,
  ProductCardData
} from "@/lib/types";

function mapProduct(product: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  garmentType: string;
  gender: ProductCardData["gender"];
  productModel: string | null;
  size: string;
  predominantColor: string;
  price: { toString(): string } | number | null;
  imageUrl: string | null;
  createdAt: Date;
  viewCount: number;
  inquiryCount: number;
}): ProductCardData {
  return {
    ...product,
    price: product.price === null ? null : Number(product.price.toString())
  };
}

function mapBanner(banner: BannerData): BannerData {
  return banner;
}

function getMockFacets(products: ProductCardData[]): CatalogFacets {
  return {
    types: [...new Set(products.map((product) => product.garmentType))].sort(),
    genders: [...new Set(products.map((product) => product.gender))].sort(),
    sizes: [...new Set(products.map((product) => product.size))].sort(),
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
      (!filters.size || product.size === filters.size) &&
      (!filters.color || product.predominantColor === filters.color)
    );
  });
}

export async function getHomeData() {
  if (!prisma) {
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
    const filteredProducts = filterMockProducts(filters);

    return {
      products: filteredProducts,
      facets: getMockFacets(mockProducts)
    };
  }

  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      isAvailable: true,
      ...(filters.type ? { garmentType: filters.type } : {}),
      ...(filters.gender ? { gender: filters.gender as ProductCardData["gender"] } : {}),
      ...(filters.size ? { size: filters.size } : {}),
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
    take: 60
  });

  const facetProducts = await prisma.product.findMany({
    where: { status: "ACTIVE", isAvailable: true },
    select: {
      garmentType: true,
      gender: true,
      size: true,
      predominantColor: true
    }
  });

  return {
    products: products.map(mapProduct),
    facets: {
      types: [...new Set(facetProducts.map((product) => product.garmentType))].sort(),
      genders: [...new Set(facetProducts.map((product) => product.gender))].sort(),
      sizes: [...new Set(facetProducts.map((product) => product.size))].sort(),
      colors: [...new Set(facetProducts.map((product) => product.predominantColor))].sort()
    }
  };
}

export async function getProductBySlug(
  slug: string,
  options: { incrementView?: boolean } = { incrementView: true }
) {
  if (!prisma) {
    return mockProducts.find((product) => product.slug === slug) ?? null;
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
