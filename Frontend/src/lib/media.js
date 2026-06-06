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
  for (const source of sources) {
    for (const candidate of unwrapSources(source)) {
      if (!candidate) continue;
      if (typeof candidate === "string") {
        const directUrl = firstNonEmpty(candidate);
        if (directUrl) return directUrl;
        continue;
      }

      const logo = firstNonEmpty(
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

      if (logo) return logo;
    }
  }

  return null;
};