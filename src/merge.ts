import { JSONFile, Low } from "lowdb";
import { createDatabase, createResultFile } from "./db";
import { createLogger } from "./log";
import { merge } from "./mergeBook";
import type { Book, DatabaseContents } from "./types";

const [,, ...files] = process.argv;
const fileName = createResultFile('merge');
const log = createLogger(fileName);

const books: Record<number, Book> = {};
let counter = 0;

try {
  await Promise.all(
    files.map(async (file) => {
      const old = new Low(new JSONFile<DatabaseContents>(file));
      await old.read();

      const count = old.data.books?.length || 0;

      log.log(`Merging ${file}... (${count} books})`);
      old.data.books?.reduce(merge, books);

      counter += count;
    }),
  );

  const db = createDatabase(fileName);

  db.data = { books: Object.values(books) };

  await db.write();

  const decrease = (((counter - db.data.books.length) / counter) * 100).toFixed(2);
  log.log(`Wrote ${db.data.books.length} unqiue book(s) to disk (${counter} merged, ${decrease}% decrease)`);
} finally {
  log.close();
}
