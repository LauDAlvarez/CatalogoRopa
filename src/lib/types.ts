export type Gender = "MUJER" | "HOMBRE" | "UNISEX" | "NINOS";
export type BannerPlacement = "HERO" | "SECONDARY";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  garmentType: string;
  gender: Gender;
  productModel?: string | null;
  size: string;
  sizeFrom?: string | null;
  sizeTo?: string | null;
  isOneSize?: boolean;
  predominantColor: string;
  price?: number | null;
  imageUrl?: string | null;
  imageUrls?: string[];
  createdAt?: Date | string;
  viewCount?: number;
  inquiryCount?: number;
};

export type BannerData = {
  id: string;
  title: string;
  titleColor?: string | null;
  subtitle?: string | null;
  imageUrl: string;
  placement: BannerPlacement;
};

export type CatalogFilters = {
  q?: string;
  type?: string;
  gender?: string;
  size?: string;
  color?: string;
};

export type CatalogFacets = {
  types: string[];
  genders: string[];
  sizes: string[];
  colors: string[];
};
