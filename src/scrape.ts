import scrapeIt, { ScrapeOptions } from "scrape-it";
import type { Book, ScrapeResults, Context } from './types';

export const BASE_URL = 'https://www.goodreads.com';

export const getPage = (url: string) => (/https?:\/\//.test(url) ? url : BASE_URL + url);

export const writeSeries = async (ctx: Context, results: Book[]) => {
  const books = ctx.db.data?.books ?? [];

  ctx.logger.log(`[${ctx.prefix}] Adding ${results.length} book(s) (${books.length} stored)`);

  ctx.db.data = {
    ...ctx.db.data,
    books: books.concat(results.map((book) => ({
      ...book,
      series: book.series ?? /.*\(([^)]+)\)/.exec(book.title)?.[1].trim() ?? null,
    }))),
  };

  await ctx.db.write();
}

export const parseCoverUrl = (url: string) => (
  `${url}`.replace(/\._(?:S[XY]\d+_){1,}/, '')
);

export const parseNumber = (val: string) => (
  Number.parseInt(`${val}`.match(/([,\d]+) ratings/)?.[1].replace(',', '') ?? '', 10) || 0
);

export async function scrape(ctx: Context, initialPage: string, options: ScrapeOptions) {
  // Root request
  const { data } = await scrapeIt<ScrapeResults>(getPage(initialPage), options);
  ctx.db.data = { ...ctx.db.data, title: data.title || '' };

  await writeSeries(ctx, data.books);

  // Paginated requests
  // TODO async?
  let nextPage = data.nextPage;

  while (nextPage) {
    const { data: nextPageData } = await scrapeIt<ScrapeResults>(getPage(nextPage), options);
    await writeSeries(ctx, nextPageData.books);
    nextPage = nextPageData.nextPage;
  }
}
