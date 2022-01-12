import scrapeIt, { ScrapeOptions } from "scrape-it";
import type { Book, ScrapeResults, Database } from './types';

export const BASE_URL = 'https://www.goodreads.com';

export const getPage = (url: string) => (/https?:\/\//.test(url) ? url : BASE_URL + url);

export const writeSeries = async (db: Database, results: Book[]) => {
  const books = db.data?.books ?? [];

  console.log(`Adding ${results.length} book(s) (${books.length} stored)`);

  db.data = {
    ...db.data,
    books: books.concat(results.map((book) => ({
      ...book,
      series: /.*\(([^)]+)\)/.exec(book.title)?.[1].trim() ?? null,
    }))),
  };

  await db.write();
}

export const parseCoverUrl = (url: string) => (
  `${url}`.replace(/\._(?:S[XY]\d+_){1,}/, '')
);

export const parseNumber = (val: string) => (
  Number.parseInt(`${val}`.match(/([,\d]+) ratings/)?.[1].replace(',', '') ?? '', 10) || 0
);

export async function scrape(db: Database, initialPage: string, options: ScrapeOptions) {
  // Root request
  const { data } = await scrapeIt<ScrapeResults>(getPage(initialPage), options);
  db.data = { ...db.data, title: data.title || '' };

  await writeSeries(db, data.books);

  // Paginated requests
  // TODO async?
  let nextPage = data.nextPage;

  while (nextPage) {
    const { data: nextPageData } = await scrapeIt<ScrapeResults>(getPage(nextPage), options);
    await writeSeries(db, nextPageData.books);
    nextPage = nextPageData.nextPage;
  }
}
