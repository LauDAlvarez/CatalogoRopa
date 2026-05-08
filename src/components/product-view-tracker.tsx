"use client";

import { useEffect } from "react";

type ProductViewTrackerProps = {
  slug: string;
};

const VIEW_STORAGE_PREFIX = "catalogo-product-view:";
const VIEW_TTL_MS = 30 * 60 * 1000;

export function ProductViewTracker({ slug }: ProductViewTrackerProps) {
  useEffect(() => {
    const storageKey = `${VIEW_STORAGE_PREFIX}${slug}`;
    const currentTimestamp = Date.now();
    const previousTimestamp = Number(window.sessionStorage.getItem(storageKey) || "0");

    if (previousTimestamp && currentTimestamp - previousTimestamp < VIEW_TTL_MS) {
      return;
    }

    window.sessionStorage.setItem(storageKey, currentTimestamp.toString());

    fetch(`/api/products/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      keepalive: true
    }).catch(() => undefined);
  }, [slug]);

  return null;
}
