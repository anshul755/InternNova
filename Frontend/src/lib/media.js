import { CORE_API_BASE } from "./serviceConfig.js";

const firstNonEmpty = (...values) =>
  values.find((value) => typeof value === "string" && value.trim()) || null;

const unwrapSources = (source) => {
  if (!source) return [];
  if (typeof source === "string") return [source];
  if (typeof source !== "object") return [];

  const nested = [];
  if (source.data) nested.push(source.data);
  if (source.company) nested.push(source.company);
  if (source.profile) nested.push(source.profile);
  if (source.user) nested.push(source.user);
  return [source, ...nested];
};

export const resolveLogoUrl = (...sources) => {
  let resolvedUrl = null;

  for (const source of sources) {
    for (const candidate of unwrapSources(source)) {
      if (!candidate) continue;
      if (typeof candidate === "string") {
        resolvedUrl = firstNonEmpty(candidate);
        if (resolvedUrl) break;
        continue;
      }

      resolvedUrl = firstNonEmpty(
        candidate.logoUrl,
        candidate.logo,
        candidate.logo_url,
        candidate.imageUrl,
        candidate.image_url,
        candidate.avatarUrl,
        candidate.avatar_url,
        candidate.photoUrl,
        candidate.photo_url,
        candidate.photo,
      );

      if (resolvedUrl) break;
    }
    if (resolvedUrl) break;
  }

  // Convert Google Drive viewer links to direct image URLs
  if (resolvedUrl && resolvedUrl.includes("drive.google.com/file/d/")) {
    const match = resolvedUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      resolvedUrl = `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  if (resolvedUrl && resolvedUrl.startsWith('/')) {
    return `${CORE_API_BASE}${resolvedUrl}`;
  }

  return resolvedUrl || null;
};