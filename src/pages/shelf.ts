import { BASE_URL, parseCoverUrl, parseNumber, scrape } from "../scrape";
import type { Context } from "../types";

export async function scrapeShelf(ctx: Context, userId: string, query: string) {
  await scrape(ctx, `/review/list/${userId}?shelf=${query}&view=table&per_page=100`, {
    books: {
      listItem: 'table#books tr.bookalike',
      data: {
        id: {
          selector: '.field.cover .tooltipTrigger',
          attr: 'data-resource-id',
          convert: (val) => Number.parseInt(val, 10),
        },
        title: {
          selector: '.field.title .value a',
          attr: 'title'
        },
        authors: {
          listItem: '.field.author .value',
          data: {
            name: {
              selector: 'a',
              convert: (val: string) => val.split(',').reverse().join(' ').trim(),
            },
            url: {
              selector: 'a',
              attr: 'href',
            }
          },
        },
        rating: {
          selector: '.field.avg_rating .value',
          convert: (val) => Number.parseFloat(val.replace(',', '') ?? '') || null,
        },
        ratings: {
          selector: '.field.num_ratings .value',
          convert: (val) => Number.parseInt(val.replace(',', ''), 10) || null,
        },
        publishedAt: {
          selector: '.field.date_pub .value',
          convert: (val) => Number.parseInt(`${val}`.match(/(\d{4})/)?.[1] ?? '', 10) || null,
        },
        coverUrl: {
          selector: '.field.cover img',
          attr: 'src',
          convert: parseCoverUrl,
        },
        url: {
          selector: '.field.title a',
          attr: 'href',
          convert: (val) => BASE_URL + val,
        },
      },
    },
    nextPage: {
      selector: '#pagestuff #reviewPagination a.next_page',
      attr: 'href',
    },
    pageCount: {
      selector: '#pagestuff #reviewPagination a:nth-last-child(2)',
      convert: (val) => Number.parseInt(val, 10),
    }
  });
}
