import { scrape } from "../scrape";
import type { Context } from "../types";
import { getPage } from "../url";

export async function scrapeSearch(ctx: Context, query: string) {
  await scrape(ctx, `/search?q=${query}&search_type=books&search%5Bfield%5D=title`, {
    books: {
      listItem: '.tableList tr',
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
          selector: '.minirating',
          convert: (val) => Number.parseFloat(`${val}`.match(/(\d\.\d*)/)?.[1] ?? '') || null,
        },
        ratings: {
          selector: '.minirating',
          convert: (val) => Number.parseInt(`${val}`.match(/([,\d]+) ratings/)?.[1].replace(',', '') ?? '', 10) || 0,
        },
        publishedAt: {
          selector: '.uitext',
          convert: (val) => Number.parseInt(`${val}`.match(/published\s+(\d{4})/)?.[1] ?? '', 10) || null,
        },
        coverUrl: {
          selector: '.bookCover',
          attr: 'src',
          convert: (val) => `${val}`.replace(/\._(?:S[XY]\d+_){1,}/, ''),
        },
        url: {
          selector: '.bookTitle',
          attr: 'href',
          convert: (val) => getPage(val),
        },
      },
    },
    nextPage: {
      selector: '.next_page',
      attr: 'href',
    },
  });
}
