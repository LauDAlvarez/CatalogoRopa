import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { ProductCardData } from "@/lib/types";

type ProductSectionProps = {
  title: string;
  eyebrow: string;
  products: ProductCardData[];
};

export function ProductSection({ title, eyebrow, products }: ProductSectionProps) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="section">
      <div className="container section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <Link href="/catalogo" className="text-link">
          Ver catalogo
        </Link>
      </div>
      <div className="container product-row">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

