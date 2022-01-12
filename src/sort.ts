import { Low, JSONFile } from 'lowdb';

import type { Book } from './types';

const adapter = new JSONFile<{ books: Book[] }>(`./results-vampire-1372a886.json`);
const db = new Low(adapter);

await db.read();

const remapped = db.data.books
  .map((book) => book.series)
  .filter((series) => !!series)
  .map((series) => (/^(.*?),?\s#/.exec(series)?.[1] ?? series).trim())

const unique = [...new Set(remapped)];
const sorted = unique.sort((a, b) => a.localeCompare(b))

console.log(sorted)
