import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductCardData } from "@/lib/types";

export function ProductCard({ product }: { product: ProductCardData }) {
  const price = formatPrice(product.price);
  const primaryImage = product.imageUrls?.[0] || product.imageUrl;
  const imageCount = product.imageUrls?.length || (primaryImage ? 1 : 0);

  return (
    <article className="product-card">
      <Link href={`/catalogo/${product.slug}`} className="product-image-link">
        {primaryImage ? (
          <>
            <img src={primaryImage} alt={product.name} className="product-image" loading="lazy" />
            {imageCount > 1 ? <span className="product-image-count">{imageCount} fotos</span> : null}
          </>
        ) : (
          <div className="product-image product-image-empty" aria-hidden="true" />
        )}
      </Link>
      <div className="product-card-body">
        <div>
          <p className="product-meta">
            {product.garmentType} / {product.gender}
          </p>
          <h3>
            <Link href={`/catalogo/${product.slug}`}>{product.name}</Link>
          </h3>
        </div>
        <dl className="product-specs">
          <div>
            <dt>Talle</dt>
            <dd>{product.size}</dd>
          </div>
          <div>
            <dt>Color</dt>
            <dd>{product.predominantColor}</dd>
          </div>
          {product.productModel ? (
            <div>
              <dt>Modelo</dt>
              <dd>{product.productModel}</dd>
            </div>
          ) : null}
        </dl>
        {price ? <p className="product-price">{price}</p> : null}
      </div>
    </article>
  );
}
