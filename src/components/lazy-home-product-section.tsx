"use client";

import { useEffect, useRef, useState } from "react";
import { ProductSection } from "@/components/product-section";
import type { ProductCardData } from "@/lib/types";

type LazyHomeProductSectionProps = {
  title: string;
  eyebrow: string;
  products: ProductCardData[];
};

function ProductSectionSkeleton({
  title,
  eyebrow
}: Pick<LazyHomeProductSectionProps, "title" | "eyebrow">) {
  return (
    <section className="section">
      <div className="container section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="container product-row product-row-placeholder" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <article key={index} className="product-card product-card-skeleton">
            <div className="product-image-link product-image-skeleton" />
            <div className="product-card-body">
              <div className="skeleton-line skeleton-line-short" />
              <div className="skeleton-line" />
              <div className="skeleton-grid">
                <div className="skeleton-line" />
                <div className="skeleton-line" />
              </div>
              <div className="skeleton-line skeleton-line-short" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function LazyHomeProductSection({
  title,
  eyebrow,
  products
}: LazyHomeProductSectionProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      return;
    }

    const node = sentinelRef.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      setIsActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "280px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isActive]);
  return (
    <div ref={sentinelRef}>
      {isActive ? (
        <ProductSection title={title} eyebrow={eyebrow} products={products} />
      ) : (
        <ProductSectionSkeleton title={title} eyebrow={eyebrow} />
      )}
    </div>
  );
}
