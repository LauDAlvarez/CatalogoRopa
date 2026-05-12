export type CloudinaryImageAsset = {
  publicId: string;
  secureUrl: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
  version: number | null;
  originalFilename: string | null;
  resourceType: "image";
};

type CloudinaryTransformOptions = {
  width?: number;
  height?: number;
  aspectRatio?: string;
  crop?: "fill" | "limit" | "thumb";
  gravity?: "auto" | "faces" | "center";
  quality?: string | number;
  format?: string;
  dpr?: string;
};

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function normalizeString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function parseCloudinaryImageAsset(value: unknown): CloudinaryImageAsset | null {
  const record = asRecord(value);

  if (!record) {
    return null;
  }

  const publicId = normalizeString(record.publicId);
  const secureUrl = normalizeString(record.secureUrl);

  if (!publicId || !secureUrl) {
    return null;
  }

  return {
    publicId,
    secureUrl,
    width: normalizeNumber(record.width),
    height: normalizeNumber(record.height),
    format: normalizeString(record.format),
    bytes: normalizeNumber(record.bytes),
    version: normalizeNumber(record.version),
    originalFilename: normalizeString(record.originalFilename),
    resourceType: "image"
  };
}

export function parseCloudinaryImageAssets(value: unknown) {
  return Array.isArray(value)
    ? value
        .map((entry) => parseCloudinaryImageAsset(entry))
        .filter((entry): entry is CloudinaryImageAsset => Boolean(entry))
    : [];
}

function isCloudinaryUploadUrl(url: string) {
  return /res\.cloudinary\.com\/.+\/image\/upload\//i.test(url);
}

export function buildCloudinaryImageUrl(
  sourceUrl: string | null | undefined,
  options: CloudinaryTransformOptions = {}
) {
  if (!sourceUrl) {
    return sourceUrl || null;
  }

  if (!isCloudinaryUploadUrl(sourceUrl)) {
    return sourceUrl;
  }

  const transformations = [
    options.crop ? `c_${options.crop}` : null,
    options.gravity ? `g_${options.gravity}` : null,
    options.aspectRatio ? `ar_${options.aspectRatio}` : null,
    options.width ? `w_${options.width}` : null,
    options.height ? `h_${options.height}` : null,
    options.dpr ? `dpr_${options.dpr}` : "dpr_auto",
    options.format ? `f_${options.format}` : "f_auto",
    options.quality ? `q_${options.quality}` : "q_auto"
  ].filter(Boolean);

  if (!transformations.length) {
    return sourceUrl;
  }

  return sourceUrl.replace("/image/upload/", `/image/upload/${transformations.join(",")}/`);
}

export function buildResponsiveImageSet(
  sourceUrl: string | null | undefined,
  widths: number[],
  options: Omit<CloudinaryTransformOptions, "width">
) {
  const resolvedWidths = [...new Set(widths.filter((width) => Number.isFinite(width) && width > 0))];

  if (!sourceUrl || !resolvedWidths.length) {
    return {
      src: sourceUrl || "",
      srcSet: undefined as string | undefined
    };
  }

  if (!isCloudinaryUploadUrl(sourceUrl)) {
    return {
      src: sourceUrl,
      srcSet: undefined as string | undefined
    };
  }

  return {
    src: buildCloudinaryImageUrl(sourceUrl, {
      ...options,
      width: resolvedWidths[resolvedWidths.length - 1]
    }) || sourceUrl,
    srcSet: resolvedWidths
      .map((width) => {
        const url = buildCloudinaryImageUrl(sourceUrl, {
          ...options,
          width
        });

        return url ? `${url} ${width}w` : null;
      })
      .filter((entry): entry is string => Boolean(entry))
      .join(", ")
  };
}
