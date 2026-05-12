"use client";

import { useEffect, useState } from "react";
import { buildResponsiveImageSet } from "@/lib/cloudinary-images";

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const safeImages = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = safeImages[activeIndex] ?? safeImages[0];
  const activeImageProps = buildResponsiveImageSet(activeImage, [480, 720, 960, 1280], {
    aspectRatio: "4:5",
    crop: "fill",
    gravity: "auto"
  });

  useEffect(() => {
    setActiveIndex(0);
  }, [safeImages.length, safeImages[0]]);

  if (!activeImage) {
    return <div className="product-detail-empty" aria-hidden="true" />;
  }

  return (
    <div className="product-gallery">
      <div className="product-gallery-stage">
        <img
          src={activeImageProps.src}
          srcSet={activeImageProps.srcSet}
          sizes="(max-width: 767px) 92vw, 48vw"
          alt={alt}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </div>
      {safeImages.length > 1 ? (
        <div className="product-gallery-thumbs" aria-label="Galeria de imagenes del producto">
          {safeImages.map((imageUrl, index) => {
            const thumbProps = buildResponsiveImageSet(imageUrl, [120, 180, 240], {
              aspectRatio: "1:1",
              crop: "fill",
              gravity: "auto"
            });

            return (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                className={`product-gallery-thumb ${index === activeIndex ? "is-active" : ""}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver imagen ${index + 1}`}
                aria-pressed={index === activeIndex}
              >
                <img
                  src={thumbProps.src}
                  srcSet={thumbProps.srcSet}
                  sizes="84px"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
