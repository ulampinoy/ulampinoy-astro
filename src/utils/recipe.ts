import type { CollectionEntry } from "astro:content";

export type Recipe = Exclude<NonNullable<CollectionEntry<"blog">["data"]["recipe"]>, unknown[]>;

/** "1 hr 15 mins" style label for a duration in minutes. */
export const formatMinutes = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h && `${h} hr`, m && `${m} mins`].filter(Boolean).join(" ");
};

/** Strips the markdown-ish emphasis (**bold**, _italic_) used in recipe text. */
export const plainText = (text: string) => text.replace(/\*\*|(^|\s)_|_(?=\s|[.,;:!?)]|$)/g, "$1");

/** All recipe cards of a post, whether its frontmatter has one recipe or a list. */
export const getRecipes = (data: CollectionEntry<"blog">["data"]): Recipe[] =>
  data.recipe === undefined ? [] : Array.isArray(data.recipe) ? data.recipe : [data.recipe];

/** Anchor id of a post's nth recipe card ("recipe", "recipe-2", ...). */
export const recipeAnchor = (index = 0) => (index ? `recipe-${index + 1}` : "recipe");

/** File name (no extension) of the nth recipe's PDF for a blog entry id. */
export const recipePdfName = (id: string, index = 0) =>
  `${id.split("/").pop()}${index ? `-${index + 1}` : ""}`;

/** Path of the downloadable PDF recipe card for a blog entry id. */
export const recipePdfPath = (id: string, index = 0) => `/recipes/${recipePdfName(id, index)}.pdf`;
