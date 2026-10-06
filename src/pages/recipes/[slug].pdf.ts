import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import { rawImagePath } from "../../utils/image";
import { formatMinutes, plainText } from "../../utils/recipe";

export const prerender = true;

export const getStaticPaths = (async () => {
  const posts = await getCollection("blog", (p) => !!p.data.recipe && !p.data.draft);
  return posts.map((post) => ({ params: { slug: post.id.split("/").pop() }, props: { post } }));
}) satisfies GetStaticPaths;

const AMBER = rgb(0.96, 0.62, 0.04);
const INK = rgb(0.1, 0.1, 0.1);
const MUTED = rgb(0.42, 0.42, 0.45);
const RULE = rgb(0.88, 0.88, 0.9);
const META_BG = rgb(1, 0.98, 0.92);

const PAGE_W = 612; // US Letter
const PAGE_H = 792;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Hero image, resized and re-encoded as JPEG (pdf-lib only embeds JPEG/PNG)
async function loadHero(doc: PDFDocument, src?: string): Promise<PDFImage | undefined> {
  if (!src) return;
  try {
    const file = await readFile(join(process.cwd(), "public", rawImagePath(src)));
    const { default: sharp } = await import("sharp");
    const jpg = await sharp(file).resize(480, 480, { fit: "cover" }).jpeg({ quality: 78 }).toBuffer();
    return await doc.embedJpg(jpg);
  } catch {
    return;
  }
}

export const GET: APIRoute = async ({ props, site }) => {
  const { post } = props as { post: CollectionEntry<"blog"> };
  const data = post.data;
  const recipe = data.recipe!;

  const doc = await PDFDocument.create();
  doc.setTitle(`${data.title} — Recipe`);
  doc.setAuthor(data.author ?? "UlamPinoy");
  doc.setSubject(recipe.summary ?? data.description);
  doc.setKeywords(recipe.keywords);

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const supported = new Set(regular.getCharacterSet());

  // Standard fonts are WinAnsi-only; swap anything else for a close equivalent
  const clean = (text: string) =>
    [...plainText(text).normalize("NFC")]
      .map((ch) => (supported.has(ch.codePointAt(0)!) ? ch : ch === " " || ch === " " ? " " : ""))
      .join("");

  const wrap = (text: string, font: PDFFont, size: number, width: number) => {
    const lines: string[] = [];
    let line = "";
    for (const word of clean(text).split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= width || !line) line = next;
      else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  let page: PDFPage = doc.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  const newPage = () => {
    page = doc.addPage([PAGE_W, PAGE_H]);
    page.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W, height: 6, color: AMBER });
    y = PAGE_H - MARGIN;
  };
  const ensure = (h: number) => {
    if (y - h < MARGIN + 20) newPage();
  };

  const paragraph = (
    text: string,
    { font = regular, size = 10.5, color = INK, x = MARGIN, width = CONTENT_W, leading = 1.45 } = {}
  ) => {
    for (const line of wrap(text, font, size, width)) {
      ensure(size * leading);
      page.drawText(line, { x, y: y - size, size, font, color });
      y -= size * leading;
    }
  };

  const sectionTitle = (text: string) => {
    ensure(48);
    y -= 14;
    page.drawText(text, { x: MARGIN, y: y - 16, size: 16, font: bold, color: AMBER });
    y -= 26;
  };

  const groupTitle = (text: string) => {
    ensure(30);
    y -= 4;
    page.drawText(clean(text).toUpperCase(), { x: MARGIN, y: y - 9, size: 9, font: bold, color: INK });
    y -= 18;
  };

  // Header: amber top bar, hero image, title block
  page.drawRectangle({ x: 0, y: PAGE_H - 8, width: PAGE_W, height: 8, color: AMBER });
  const hero = await loadHero(doc, data.image);
  const imgSize = 132;
  const textX = hero ? MARGIN + imgSize + 20 : MARGIN;
  const textW = PAGE_W - MARGIN - textX;
  const headerTop = y;
  if (hero) page.drawImage(hero, { x: MARGIN, y: headerTop - imgSize, width: imgSize, height: imgSize });

  paragraph(data.title, { font: bold, size: 22, x: textX, width: textW, leading: 1.2 });
  y -= 4;
  paragraph(`By ${data.author ?? "UlamPinoy"}`, { size: 9.5, color: MUTED, x: textX, width: textW });
  y -= 6;
  if (recipe.summary) paragraph(recipe.summary, { size: 10.5, x: textX, width: textW });
  y = Math.min(y, headerTop - (hero ? imgSize : 0)) - 18;

  // Meta strip: prep / cook / total / servings
  const total =
    recipe.prepTime || recipe.cookTime ? (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0) : undefined;
  const meta = [
    ["PREP", recipe.prepTime !== undefined ? formatMinutes(recipe.prepTime) : undefined],
    ["COOK", recipe.cookTime !== undefined ? formatMinutes(recipe.cookTime) : undefined],
    ["TOTAL", total !== undefined ? formatMinutes(total) : undefined],
    ["SERVINGS", recipe.servings ? String(recipe.servings) : undefined],
  ].filter(([, v]) => v) as [string, string][];
  if (meta.length) {
    const h = 44;
    page.drawRectangle({ x: MARGIN, y: y - h, width: CONTENT_W, height: h, color: META_BG, borderColor: RULE, borderWidth: 0.75 });
    const colW = CONTENT_W / meta.length;
    meta.forEach(([label, value], i) => {
      const cx = MARGIN + colW * i + colW / 2;
      page.drawText(label, { x: cx - bold.widthOfTextAtSize(label, 7.5) / 2, y: y - 16, size: 7.5, font: bold, color: MUTED });
      page.drawText(value, { x: cx - bold.widthOfTextAtSize(value, 12) / 2, y: y - 33, size: 12, font: bold, color: AMBER });
    });
    y -= h + 10;
  }

  const courseLine = [recipe.course && `Course: ${recipe.course}`, recipe.cuisine && `Cuisine: ${recipe.cuisine}`]
    .filter(Boolean)
    .join("   •   ");
  if (courseLine) paragraph(courseLine, { size: 9.5, color: MUTED });

  // Ingredients with tick boxes
  sectionTitle("Ingredients");
  for (const g of recipe.ingredients) {
    if (g.group) groupTitle(g.group);
    for (const item of g.items) {
      const lines = wrap(item, regular, 10.5, CONTENT_W - 20);
      ensure(lines.length * 15 + 4);
      page.drawRectangle({ x: MARGIN, y: y - 10, width: 8.5, height: 8.5, borderColor: MUTED, borderWidth: 0.8 });
      paragraph(item, { x: MARGIN + 18, width: CONTENT_W - 18 });
      y -= 3;
    }
    y -= 6;
  }

  // Numbered instructions
  sectionTitle("Instructions");
  for (const g of recipe.instructions) {
    if (g.group) groupTitle(g.group);
    g.steps.forEach((step, i) => {
      const lines = wrap(step, regular, 10.5, CONTENT_W - 28);
      ensure(Math.min(lines.length, 3) * 15 + 6);
      page.drawCircle({ x: MARGIN + 8, y: y - 7, size: 8, color: AMBER });
      const n = String(i + 1);
      page.drawText(n, { x: MARGIN + 8 - bold.widthOfTextAtSize(n, 8.5) / 2, y: y - 10, size: 8.5, font: bold, color: rgb(1, 1, 1) });
      paragraph(step, { x: MARGIN + 26, width: CONTENT_W - 26 });
      y -= 7;
    });
    y -= 4;
  }

  if (recipe.notes.length) {
    sectionTitle("Recipe Notes");
    recipe.notes.forEach((note, i) => {
      ensure(15);
      page.drawText(`${i + 1}.`, { x: MARGIN, y: y - 10.5, size: 10.5, font: bold, color: INK });
      paragraph(note, { x: MARGIN + 18, width: CONTENT_W - 18 });
      y -= 5;
    });
  }

  const n = recipe.nutrition;
  if (n) {
    const parts = [
      n.calories && `Calories: ${n.calories}`,
      n.protein && `Protein: ${n.protein}`,
      n.fat && `Fat: ${n.fat}`,
      n.carbohydrates && `Carbohydrates: ${n.carbohydrates}`,
    ].filter(Boolean);
    if (parts.length) {
      ensure(50);
      y -= 12;
      page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.75, color: RULE });
      y -= 12;
      paragraph("NUTRITION (PER SERVING, ESTIMATED)", { font: bold, size: 8.5 });
      paragraph(parts.join("  •  "), { size: 9.5, color: MUTED });
    }
  }

  // Footer on every page: source link + page number
  const url = new URL(`/blog/${post.id}`, site ?? "https://ulampinoy.com").toString();
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawText(clean(`${data.title}  •  ${url}`), { x: MARGIN, y: 24, size: 8, font: regular, color: MUTED });
    const label = `${i + 1} / ${pages.length}`;
    p.drawText(label, { x: PAGE_W - MARGIN - regular.widthOfTextAtSize(label, 8), y: 24, size: 8, font: regular, color: MUTED });
  });

  const bytes = await doc.save();
  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${post.id.split("/").pop()}-recipe.pdf"`,
    },
  });
};
