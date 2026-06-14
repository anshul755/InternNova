import { useEffect } from "react";

function ensureMeta(selector, attributes) {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    document.head.appendChild(element);
  }

  return element;
}

export default function Seo({
  title,
  description,
  path,
  ogType = "website",
}) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const origin = window.location.origin;
    const url = `${origin}${path}`;

    const descriptionMeta = ensureMeta('meta[name="description"]', {
      name: "description",
    });
    descriptionMeta.setAttribute("content", description);

    const ogTitle = ensureMeta('meta[property="og:title"]', {
      property: "og:title",
    });
    ogTitle.setAttribute("content", title);

    const ogDescription = ensureMeta('meta[property="og:description"]', {
      property: "og:description",
    });
    ogDescription.setAttribute("content", description);

    const ogTypeMeta = ensureMeta('meta[property="og:type"]', {
      property: "og:type",
    });
    ogTypeMeta.setAttribute("content", ogType);

    const ogUrl = ensureMeta('meta[property="og:url"]', {
      property: "og:url",
    });
    ogUrl.setAttribute("content", url);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", url);

    return () => {
      document.title = previousTitle;
    };
  }, [description, ogType, path, title]);

  return null;
}
