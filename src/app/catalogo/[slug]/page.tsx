import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product-gallery";
import { formatPrice } from "@/lib/format";
import { getProductBySlug } from "@/lib/catalog-data";
import { siteConfig } from "@/lib/site-config";
import { getWhatsappBubbleConfig } from "@/lib/whatsapp-config";
import {
  buildWhatsappUrl,
  getProductStockLabel,
  renderProductWhatsappMessage
} from "@/lib/whatsapp";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug, { incrementView: false });

  if (!product) {
    return {
      title: "Producto no encontrado"
    };
  }

  return {
    title: product.name,
    description: product.description || `${product.garmentType} ${product.predominantColor}`
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const price = formatPrice(product.price);
  const whatsappSettings = await getWhatsappBubbleConfig();
  const galleryImages = product.imageUrls?.filter(Boolean)?.length
    ? product.imageUrls.filter(Boolean)
    : product.imageUrl
      ? [product.imageUrl]
      : [];
  const stockLabel = getProductStockLabel(product);
  const productMessageTemplate =
    whatsappSettings.productMessage.trim() ||
    whatsappSettings.message.trim() ||
    siteConfig.whatsappProductMessage;
  const productWhatsappUrl = buildWhatsappUrl(
    whatsappSettings.phone,
    renderProductWhatsappMessage(productMessageTemplate, product)
  );

  return (
    <main className="product-detail-page">
      <section className="container product-detail">
        <div className="product-detail-media">
          <ProductGallery images={galleryImages} alt={product.name} />
        </div>
        <div className="product-detail-info">
          <Link href="/catalogo" className="text-link">
            Volver al catalogo
          </Link>
          <p className="eyebrow">
            {product.garmentType} / {product.gender}
          </p>
          <h1>{product.name}</h1>
          {product.description ? <p>{product.description}</p> : null}
          <p className="stock-detail-note">{stockLabel}</p>

          <dl className="detail-specs">
            <div>
              <dt>Tipo</dt>
              <dd>{product.garmentType}</dd>
            </div>
            <div>
              <dt>Genero</dt>
              <dd>{product.gender}</dd>
            </div>
            <div>
              <dt>Modelo</dt>
              <dd>{product.productModel || "Sin especificar"}</dd>
            </div>
            <div>
              <dt>Talle</dt>
              <dd>{product.size}</dd>
            </div>
            <div>
              <dt>Color predominante</dt>
              <dd>{product.predominantColor}</dd>
            </div>
          </dl>

          {price ? <p className="detail-price">{price}</p> : null}
          <Link
            href={productWhatsappUrl || "/#contacto"}
            className="button"
            target={productWhatsappUrl ? "_blank" : undefined}
            rel={productWhatsappUrl ? "noreferrer" : undefined}
          >
            {whatsappSettings.productCta}
          </Link>
        </div>
      </section>
    </main>
  );
}
