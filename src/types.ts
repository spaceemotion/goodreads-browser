import type { Low } from "lowdb";

export interface Book {
  id: number,
  title: string,
  rating: number | null,
  ratings: number,
  publishedAt: number | null,
  authors: Array<{
    name: string,
    url: string,
  }>,
  coverUrl: string,
  url: string,
  series?: string,
}

export type DatabaseContents = { books: Book[], title?: string };
export type Database = Low<DatabaseContents>;

export interface ScrapeResults {
  books: Book[],
  title: string|null,
  nextPage: string|null,
  pageCount?: number,
}

export interface Logger {
  log(line: string): void;
  close(): void;
}

export interface Context {
  db: Database,
  logger: Logger,
  prefix: string,
}
