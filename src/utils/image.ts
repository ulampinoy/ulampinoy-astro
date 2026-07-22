/**
 * Strips any existing /.netlify/images?url= prefix and query string from an image path
 * so it can be re-wrapped cleanly.
 */
export function rawImagePath(src: string | undefined): string {
  if (!src) return "/images/default-blog.jpg";
  let path = src;
  const prefix = "/.netlify/images?url=";
  if (path.startsWith(prefix)) {
    const rest = path.slice(prefix.length);
    const ampIdx = rest.indexOf("&");
    path = ampIdx >= 0 ? rest.slice(0, ampIdx) : rest;
  }
  const qIdx = path.indexOf("?");
  if (qIdx >= 0) {
    path = path.slice(0, qIdx);
  }
  return path;
}

/**
 * Build a Netlify Image CDN URL from a raw image path.
 */
export function netlifyImage(src: string | undefined, w: number, fm = "avif", q = 80): string {
  return `/.netlify/images?url=${rawImagePath(src)}&w=${w}&fm=${fm}&q=${q}`;
}

/**
 * Build a srcset string for responsive images.
 */
export function netlifyImageSrcset(src: string | undefined, widths: number[], fm = "avif", q = 80): string {
  const raw = rawImagePath(src);
  return widths.map(w => `/.netlify/images?url=${raw}&w=${w}&fm=${fm}&q=${q} ${w}w`).join(", ");
}
