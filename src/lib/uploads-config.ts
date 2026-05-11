function normalizeBaseUrl(value?: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "";
  }

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

const uploadsPublicBaseUrl = normalizeBaseUrl(process.env.UPLOADS_PUBLIC_BASE_URL);

export function resolveUploadUrl(url: string | null | undefined) {
  if (!url) {
    return url || null;
  }

  if (!url.startsWith("/uploads/")) {
    return url;
  }

  if (!uploadsPublicBaseUrl) {
    return url;
  }

  return `${uploadsPublicBaseUrl}${url}`;
}

export function resolveUploadUrls(urls: Array<string | null | undefined>) {
  return urls
    .map((url) => resolveUploadUrl(url))
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}
