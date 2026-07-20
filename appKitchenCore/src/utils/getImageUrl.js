/** Normaliza rutas de imágenes locales y conserva URLs externas. */
export function getImageUrl(imagenUrl, fallback = "/lunchDining.svg") {
  if (!imagenUrl) return fallback;
  if (imagenUrl.startsWith("http")) return imagenUrl;
  if (imagenUrl.startsWith("/")) return imagenUrl;
  return `/${imagenUrl}`;
}
