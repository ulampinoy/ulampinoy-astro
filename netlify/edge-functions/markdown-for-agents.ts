/**
 * Netlify Edge Function: Markdown for AI Agents
 *
 * Serves Markdown instead of HTML when AI agents request it via
 * the `Accept: text/markdown` header, reducing token usage by ~80%.
 *
 * ## Testing
 *
 *   curl -H "Accept: text/markdown" https://your-site.netlify.app/blog/chicken-adobo
 *   curl -H "Accept: text/markdown" https://your-site.netlify.app/about
 *
 * ## Local testing
 *
 *   netlify dev
 *   curl -H "Accept: text/markdown" http://localhost:8888/blog/chicken-adobo
 *
 * ## Adding or removing paths
 *
 *   Edit the `config.path` array below to add new path patterns.
 *   Edit the `config.excludedPath` array to exclude specific paths.
 *   Patterns use URLPattern syntax — e.g. "/docs/*" matches all paths under /docs/.
 */

import type { Config, Context } from "@netlify/edge-functions";

/**
 * Lightweight HTML-to-Markdown converter.
 * No external dependencies — runs entirely within the edge function runtime.
 */
function htmlToMarkdown(html: string): string {
  let md = html;

  // Decode common HTML entities
  md = md.replace(/&amp;/g, "&");
  md = md.replace(/&lt;/g, "<");
  md = md.replace(/&gt;/g, ">");
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, " ");

  // Remove images, SVGs, buttons (not useful for AI agents)
  md = md.replace(/<img[^>]*>/gi, "");
  md = md.replace(/<svg[\s\S]*?<\/svg>/gi, "");
  md = md.replace(/<button[\s\S]*?<\/button>/gi, "");
  md = md.replace(/<picture[\s\S]*?<\/picture>/gi, "");
  md = md.replace(/<video[\s\S]*?<\/video>/gi, "");
  md = md.replace(/<audio[\s\S]*?<\/audio>/gi, "");
  md = md.replace(/<canvas[\s\S]*?<\/canvas>/gi, "");
  md = md.replace(/<form[\s\S]*?<\/form>/gi, "");
  md = md.replace(/<input[^>]*>/gi, "");
  md = md.replace(/<select[\s\S]*?<\/select>/gi, "");
  md = md.replace(/<textarea[\s\S]*?<\/textarea>/gi, "");

  // Headings (h1-h6)
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n");
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n");
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n");
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n");
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n##### $1\n");
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n###### $1\n");

  // Code blocks (pre > code)
  md = md.replace(
    /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    "\n```\n$1\n```\n"
  );

  // Inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");

  // Bold
  md = md.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**");

  // Italic
  md = md.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*");

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, content: string) => {
    return "\n" + content.trim().split("\n").map((line: string) => `> ${line.trim()}`).join("\n") + "\n";
  });

  // List items
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");

  // Remove list wrappers
  md = md.replace(/<\/?[uo]l[^>]*>/gi, "\n");

  // Horizontal rules
  md = md.replace(/<hr[^>]*\/?>/gi, "\n---\n");

  // Line breaks
  md = md.replace(/<br[^>]*\/?>/gi, "\n");

  // Paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n");

  // Divs and spans — just unwrap
  md = md.replace(/<\/?(div|span|section|figure|figcaption|main|article|time|abbr|mark|small|sup|sub)[^>]*>/gi, "");

  // Strip any remaining HTML tags
  md = md.replace(/<[^>]+>/g, "");

  // Clean up extra whitespace
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.trim();

  return md;
}

export default async (req: Request, context: Context) => {
  const accept = req.headers.get("accept") || "";

  // Only intercept requests that explicitly ask for Markdown
  if (!accept.includes("text/markdown")) {
    return;
  }

  // Only handle GET requests
  if (req.method !== "GET") {
    return;
  }

  try {
    const response = await context.next();

    // Only convert HTML responses
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response;
    }

    const html = await response.text();

    // Strip non-content elements before conversion
    const stripped = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<aside[\s\S]*?<\/aside>/gi, "")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
      .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
      .replace(/<!--[\s\S]*?-->/g, "");

    // Extract the main content area if possible
    const mainMatch = stripped.match(
      /<main[\s\S]*?>([\s\S]*?)<\/main>/i
    ) ||
      stripped.match(
        /<article[\s\S]*?>([\s\S]*?)<\/article>/i
      );

    const contentHtml = mainMatch ? mainMatch[1] : stripped;

    const markdown = htmlToMarkdown(contentHtml);
    const estimatedTokens = Math.ceil(markdown.length / 4);

    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "X-Markdown-Tokens": String(estimatedTokens),
        "Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
      },
    });
  } catch (_error) {
    // On any error, fall back to the original HTML response
    return context.next();
  }
};

export const config: Config = {
  path: [
    "/",
    "/about",
    "/contact",
    "/search",
    "/articles",
    "/articles/*",
    "/blog/*",
    "/glossary",
    "/glossary/*",
    "/videos",
    "/videos/*",
    "/tags",
    "/tags/*",
    "/categories/*",
  ],
  excludedPath: ["/api/*"],
  onError: "bypass",
};
