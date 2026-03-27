/**
 * Strips any existing /.netlify/images?url= prefix from an image path
 * so it can be re-wrapped without double-encoding.
 */
export function rawImagePath(src: string | undefined): string {
  if (!src) return "/images/default-blog.jpg";
  // Remove leading /.netlify/images?url= (with optional query params after the inner path)
  const prefix = "/.netlify/images?url=";
  if (src.startsWith(prefix)) {
    // Extract just the inner path (everything after the prefix, up to the first & if present)
    const rest = src.slice(prefix.length);
    // The rest may be like /images/foo.jpg&w=400... but we only want the path
    const ampIdx = rest.indexOf("&");
    return ampIdx >= 0 ? rest.slice(0, ampIdx) : rest;
  }
  return src;
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
