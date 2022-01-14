import scrapeIt, { ScrapeOptions } from "scrape-it";
import { chunk, flattenDepth } from 'lodash-es';
import { BASE_URL, getPage, writeSeries } from "../scrape";
import type { Book, Context } from "../types";

export async function scrapeTag(ctx: Context, tag: string, session: string) {
  const options: ScrapeOptions = {
    books: {
      listItem: '.leftContainer .elementList',
      data: {
        id: {
          selector: 'input#book_id',
          attr: 'value',
          convert: (val) => Number.parseInt(val, 10),
        },
        title: {
          selector: '.bookTitle',
        },
        authors: {
          listItem: '.authorName__container',
          data: {
            name: {
              selector: '.authorName',
              convert: (val) => `${val}`.replace(/\s+/, ' '),
              eq: 0, // only the name, not the type
            },
            url: {
              selector: '.authorName',
              attr: 'href',
            }
          },
        },
        rating: {
          selector: '.smallText',
          convert: (val) => Number.parseFloat(`${val}`.match(/rating (\d\.\d*)/)?.[1] ?? '') || null,
        },
        ratings: {
          selector: '.smallText',
          convert: (val) => Number.parseInt(`${val}`.match(/([,\d]+) ratings/)?.[1].replace(',', '') ?? '', 10) || 0,
        },
        publishedAt: {
          selector: '.smallText',
          convert: (val) => Number.parseInt(`${val}`.match(/published\s+(\d{4})/)?.[1] ?? '', 10) || null,
        },
        coverUrl: {
          selector: '.leftAlignedImage img',
          attr: 'src',
          convert: (val) => `${val}`.replace(/\._(?:S[XY]\d+_){1,}/, ''),
        },
        url: {
          selector: '.bookTitle',
          attr: 'href',
          convert: (val) => BASE_URL + val,
        },
      },
    },
  };

  // Root request
  const url = getPage(`/shelf/show/${tag}`);
  const { data, response } = await scrapeIt<{ books: Book[], total: number }>(url, {
    ...options,
    total: {
      selector: '.leftContainer .mediumText',
      eq: 0,
      convert: (val) => Number.parseInt(`${val}`.match(/of ([\d+,]+)/)?.[1].replace(',', '') ?? '', 10) || 0,
    },
  });

  const headers = {
    'Cookie': [
      ...response.headers['set-cookie'].map((str: string) => str.substring(0, str.indexOf(';'))),
      `u=${session}`,
      'likely_has_account=true',
    ],
  }

  await writeSeries(ctx, data.books);

  // Paginated requests
  const pages = Math.min(25, (Math.floor(data.total / data.books.length) - 1));
  const pageUrls = [];

  for (let page = 1; page < pages; page++) {
    const pageUrl = `${url}?page=${page + 1}`;
    pageUrls.push(pageUrl);
  }

  const books = await Promise.all(
    chunk(pageUrls, 2).map((chunk) => {
      return Promise.all(chunk.map(async (pageUrl) => {
        const { data: nextPageData } = await scrapeIt<{ books: Book[] }>({
          url: pageUrl,
          headers,
        }, options);

        console.log('Grabbed ' + pageUrl);

        return nextPageData.books;
      }));
    }),
  );

  const bookList = flattenDepth(books, 2) as unknown as Book[];

  await writeSeries(ctx, bookList);
}
