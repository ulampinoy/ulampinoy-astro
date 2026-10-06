/** "1 hr 15 mins" style label for a duration in minutes. */
export const formatMinutes = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return [h && `${h} hr`, m && `${m} mins`].filter(Boolean).join(" ");
};

/** Strips the markdown-ish emphasis (**bold**, _italic_) used in recipe text. */
export const plainText = (text: string) => text.replace(/\*\*|(^|\s)_|_(?=\s|[.,;:!?)]|$)/g, "$1");

/** Path of the downloadable PDF recipe card for a blog entry id. */
export const recipePdfPath = (id: string) => `/recipes/${id.split("/").pop()}.pdf`;
