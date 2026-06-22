/** Normaliza rutas de imágenes locales y conserva URLs externas. */
export function getImageUrl(imagenUrl) {
  if (!imagenUrl) return "/lunchDining.svg";
  if (imagenUrl.startsWith("http")) return imagenUrl;
  if (imagenUrl.startsWith("/")) return imagenUrl;
  return `/${imagenUrl}`;
}
