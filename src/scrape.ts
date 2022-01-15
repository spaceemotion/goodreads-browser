import scrapeIt, { ScrapeOptions } from "scrape-it";
import type { Book, ScrapeResults, Context } from './types';
import { getPage } from "./url";

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
  `${url}`.replace(/\._(?:[A-Z]+[\d,]+_){1,}/, '')
);

export const parseNumber = (val: string) => (
  Number.parseInt(`${val}`.match(/([,\d]+) ratings/)?.[1].replace(',', '') ?? '', 10) || 0
);

export async function scrape(ctx: Context, initialPage: string, options: ScrapeOptions) {
  // Root request
  const { data } = await scrapeIt<ScrapeResults>(getPage(initialPage), options);

  if (data.books.length === 0) {
    ctx.logger.log(`[${ctx.prefix}] Shelf seems to be private (or empty?)`);
    return;
  }

  ctx.db.data = { ...ctx.db.data, title: data.title || '' };
  await writeSeries(ctx, data.books);

  // Paginated requests
  if (data.pageCount) {
    ctx.logger.log(`[${ctx.prefix}] ${data.pageCount} pages found`);

    const promises = [];
    const fetchPage = async (num: number) => {
      const url = `${getPage(initialPage)}&page=${num}`;
      const { data: pageData } = await scrapeIt<ScrapeResults>(url, options);

      await writeSeries(
        {...ctx, prefix: `${ctx.prefix}: page ${num}`},
        pageData.books
      );
    }

    for (let page = 2; page <= data.pageCount; page++) {
      promises.push(fetchPage(page))
    }

    await Promise.all(promises);
    return;
  }

  let nextPage = data.nextPage;
  let pageCount = 2;

  while (nextPage) {
    ctx.logger.log(`[${ctx.prefix}] Fetching page ${pageCount}${data.pageCount ? `/${data.pageCount}`: ''}`);

    const { data: nextPageData } = await scrapeIt<ScrapeResults>(getPage(nextPage), options);
    await writeSeries(ctx, nextPageData.books);

    nextPage = nextPageData.nextPage;
    pageCount++;
  }
}
