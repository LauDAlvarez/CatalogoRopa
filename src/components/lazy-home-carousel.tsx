"use client";

import { useEffect, useRef, useState } from "react";
import { Carousel } from "@/components/carousel";
import type { BannerData } from "@/lib/types";

function CarouselSkeleton() {
  return (
    <section className="carousel carousel-secondary carousel-placeholder" aria-hidden="true">
      <div className="carousel-shade" />
      <div className="container carousel-content">
        <p className="eyebrow">Promociones</p>
        <div className="skeleton-line skeleton-line-heading" />
        <div className="skeleton-line skeleton-line-body" />
      </div>
    </section>
  );
}

export function LazyHomeCarousel({ banners }: { banners: BannerData[] }) {
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
      { rootMargin: "320px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isActive]);
  return (
    <div ref={sentinelRef}>
      {isActive ? (
        banners.length ? (
          <Carousel banners={banners} variant="secondary" label="Banners secundarios" />
        ) : null
      ) : (
        <CarouselSkeleton />
      )}
    </div>
  );
}
