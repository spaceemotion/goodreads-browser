import type { Book } from "./types";

export const merge = <T extends Record<number, Book>>(books: T, book: Book): T => {
  const existing: Partial<Book> = books[book.id] ?? {};

  books[book.id] = {
    ...book,
    rating: book.rating || (existing.rating ?? null),
    ratings: book.ratings || (existing.ratings ?? null),
    publishedAt: book.publishedAt || (existing.publishedAt ?? null),
    series: book.series ?? (existing.series ?? null),
  }

  return books;
};
