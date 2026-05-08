"use client";

import { useEffect, useMemo, useState } from "react";
import type { BannerData } from "@/lib/types";

type CarouselProps = {
  banners: BannerData[];
  variant?: "hero" | "secondary";
  label: string;
};

export function Carousel({ banners, variant = "hero", label }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeBanners = useMemo(() => banners.filter((banner) => banner.imageUrl), [banners]);
  const activeBanner = safeBanners[activeIndex] ?? safeBanners[0];

  useEffect(() => {
    if (safeBanners.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeBanners.length);
    }, variant === "hero" ? 5200 : 6200);

    return () => window.clearInterval(interval);
  }, [safeBanners.length, variant]);

  if (!activeBanner) {
    return null;
  }

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + safeBanners.length) % safeBanners.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % safeBanners.length);
  };

  const content = (
    <>
      <img
        src={activeBanner.imageUrl}
        alt=""
        className="carousel-image"
        loading={variant === "hero" ? "eager" : "lazy"}
        decoding="async"
      />
      <div className="carousel-shade" />
      <div className="container carousel-content">
        <p className="eyebrow">{variant === "hero" ? "Catalogo de temporada" : "Promociones"}</p>
        <h1 style={activeBanner.titleColor ? { color: activeBanner.titleColor } : undefined}>
          {activeBanner.title}
        </h1>
        {activeBanner.subtitle ? (
          <p style={activeBanner.subtitleColor ? { color: activeBanner.subtitleColor } : undefined}>
            {activeBanner.subtitle}
          </p>
        ) : null}
      </div>
    </>
  );

  return (
    <section className={`carousel carousel-${variant}`} aria-label={label}>
      {content}

      {safeBanners.length > 1 ? (
        <div className="carousel-controls" aria-label="Controles del carrusel">
          <button type="button" onClick={goToPrevious} aria-label="Banner anterior">
            &lt;
          </button>
          <div className="carousel-dots" aria-label="Banners disponibles">
            {safeBanners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                aria-label={`Ir al banner ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
          <button type="button" onClick={goToNext} aria-label="Banner siguiente">
            &gt;
          </button>
        </div>
      ) : null}
    </section>
  );
}
