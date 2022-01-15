import { getPage } from "./url";
import type { Author, Book } from "./types";

export const merge = <T extends Record<number, Book>>(books: T, book: Book): T => {
  const existing: Partial<Book> = books[book.id] ?? {};

  books[book.id] = {
    ...book,
    rating: book.rating || (existing.rating ?? null),
    ratings: book.ratings || (existing.ratings ?? null),
    publishedAt: book.publishedAt || (existing.publishedAt ?? null),
    series: book.series ?? (existing.series ?? null),
    authors: existing.authors === undefined
      ? book.authors
      : Object.values(
        [...book.authors, ...existing.authors]
          .reduce<Record<number, Author>>((acc, author) => {
            const authorId = Number.parseInt(author.url.match(/show\/(\d+)/)?.[1], 10);

            acc[authorId] = {
              ...author,

              // Clean up URL:
              // - Remove query parameters
              // - prepend with the goodreads base URL
              url: getPage(author.url.substring(0, Math.max(0, author.url.indexOf('?')) || undefined)),
            };

            return acc;
          }, {})
      ),
  }

  return books;
};
