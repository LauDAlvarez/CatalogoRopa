import type { BannerData, ProductCardData } from "@/lib/types";

export const mockHeroBanners: BannerData[] = [
  {
    id: "hero-1",
    title: "Nueva temporada",
    subtitle: "Prendas livianas, colores suaves y siluetas simples para todos los dias.",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=82",
    placement: "HERO"
  },
  {
    id: "hero-2",
    title: "Basicos seleccionados",
    subtitle: "Remeras, camisas y pantalones listos para combinar.",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=82",
    placement: "HERO"
  }
];

export const mockSecondaryBanners: BannerData[] = [
  {
    id: "secondary-1",
    title: "Hasta 3 cuotas",
    subtitle: "Consulta disponibilidad y formas de pago antes de retirar.",
    imageUrl:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=80",
    placement: "SECONDARY"
  },
  {
    id: "secondary-2",
    title: "Looks de fin de semana",
    subtitle: "Piezas comodas para armar conjuntos simples.",
    imageUrl:
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=80",
    placement: "SECONDARY"
  }
];

export const mockProducts: ProductCardData[] = [
  {
    id: "prod-1",
    name: "Camisa lino clara",
    slug: "camisa-lino-clara",
    description: "Camisa de lino con calce relajado y botones nacarados.",
    garmentType: "Camisa",
    gender: "UNISEX",
    productModel: "Relax",
    size: "S a L",
    sizeFrom: "S",
    sizeTo: "L",
    isOneSize: false,
    predominantColor: "Blanco",
    price: 44900,
    imageUrl:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80"
    ],
    viewCount: 96,
    inquiryCount: 18,
    createdAt: new Date("2026-04-10")
  },
  {
    id: "prod-2",
    name: "Pantalon sastrero",
    slug: "pantalon-sastrero",
    description: "Pantalon recto con cintura media y bolsillos laterales.",
    garmentType: "Pantalon",
    gender: "MUJER",
    productModel: "Recto",
    size: "Talle unico (S)",
    sizeFrom: "S",
    sizeTo: null,
    isOneSize: true,
    predominantColor: "Negro",
    price: 58200,
    imageUrl:
      "https://images.unsplash.com/photo-1506629905607-d9c297d7bbba?auto=format&fit=crop&w=900&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1506629905607-d9c297d7bbba?auto=format&fit=crop&w=900&q=80"
    ],
    viewCount: 130,
    inquiryCount: 26,
    createdAt: new Date("2026-04-12")
  },
  {
    id: "prod-3",
    name: "Remera algodon premium",
    slug: "remera-algodon-premium",
    description: "Remera basica de algodon peinado con cuello redondo.",
    garmentType: "Remera",
    gender: "HOMBRE",
    productModel: "Clasica",
    size: "M a XL",
    sizeFrom: "M",
    sizeTo: "XL",
    isOneSize: false,
    predominantColor: "Azul",
    price: 22900,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80"
    ],
    viewCount: 182,
    inquiryCount: 31,
    createdAt: new Date("2026-04-15")
  },
  {
    id: "prod-4",
    name: "Vestido midi",
    slug: "vestido-midi",
    description: "Vestido midi de textura liviana con tiras regulables.",
    garmentType: "Vestido",
    gender: "MUJER",
    productModel: "Midi",
    size: "S a M",
    sizeFrom: "S",
    sizeTo: "M",
    isOneSize: false,
    predominantColor: "Verde",
    price: 63800,
    imageUrl:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80"
    ],
    viewCount: 111,
    inquiryCount: 22,
    createdAt: new Date("2026-04-18")
  },
  {
    id: "prod-5",
    name: "Campera denim",
    slug: "campera-denim",
    description: "Campera de jean con lavado medio y bolsillos frontales.",
    garmentType: "Campera",
    gender: "UNISEX",
    productModel: "Denim",
    size: "M a XL",
    sizeFrom: "M",
    sizeTo: "XL",
    isOneSize: false,
    predominantColor: "Celeste",
    price: 72100,
    imageUrl:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=900&q=80"
    ],
    viewCount: 88,
    inquiryCount: 14,
    createdAt: new Date("2026-04-19")
  },
  {
    id: "prod-6",
    name: "Buzo frisa suave",
    slug: "buzo-frisa-suave",
    description: "Buzo amplio de frisa con capucha y bolsillo frontal.",
    garmentType: "Buzo",
    gender: "UNISEX",
    productModel: "Oversize",
    size: "L a XXL",
    sizeFrom: "L",
    sizeTo: "XXL",
    isOneSize: false,
    predominantColor: "Gris",
    price: 51500,
    imageUrl:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
    imageUrls: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80"
    ],
    viewCount: 151,
    inquiryCount: 29,
    createdAt: new Date("2026-04-20")
  }
];
