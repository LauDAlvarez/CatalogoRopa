export const siteConfig = {
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME || "Tu Marca",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  whatsappPhone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "",
  whatsappMessage:
    process.env.NEXT_PUBLIC_WHATSAPP_MESSAGE ||
    "Hola, quiero consultar por los productos del catalogo.",
  nav: [
    { label: "Inicio", href: "/" },
    { label: "Nosotros", href: "/#nosotros" },
    { label: "Catalogo", href: "/catalogo" },
    { label: "Faqs", href: "/#faqs" },
    { label: "Contacto", href: "/#contacto" }
  ]
};
