"use client";

import { useEffect, useState } from "react";

type ProductGalleryProps = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const safeImages = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = safeImages[activeIndex] ?? safeImages[0];

  useEffect(() => {
    setActiveIndex(0);
  }, [safeImages.length, safeImages[0]]);

  if (!activeImage) {
    return <div className="product-detail-empty" aria-hidden="true" />;
  }

  return (
    <div className="product-gallery">
      <div className="product-gallery-stage">
        <img src={activeImage} alt={alt} />
      </div>
      {safeImages.length > 1 ? (
        <div className="product-gallery-thumbs" aria-label="Galeria de imagenes del producto">
          {safeImages.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              className={`product-gallery-thumb ${index === activeIndex ? "is-active" : ""}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Ver imagen ${index + 1}`}
              aria-pressed={index === activeIndex}
            >
              <img src={imageUrl} alt="" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
