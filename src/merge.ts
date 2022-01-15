import { JSONFile, Low } from "lowdb";
import { createDatabase, createResultFile } from "./db";
import { createLogger } from "./log";
import { merge } from "./mergeBook";
import type { Book, DatabaseContents } from "./types";

const [,, ...files] = process.argv;
const fileName = createResultFile('merge');
const log = createLogger(fileName);

const books: Record<number, Book> = {};

try {
  await Promise.all(
    files.map(async (file) => {
      const old = new Low(new JSONFile<DatabaseContents>(file));
      await old.read();

      log.log(`Merging ${file}...`);
      old.data.books?.reduce(merge, books);
    }),
  );

  const db = createDatabase(fileName);

  db.data = { books: Object.values(books) };

  await db.write();

  log.log(`Wrote ${db.data.books.length} book(s) to disk`);
} finally {
  log.close();
}
