import { createDatabase, createResultFile } from "./db";
import { createLogger } from "./log";
import { scrapeList } from "./pages/list";
import { scrapeSearch } from "./pages/search";
import { scrapeShelf } from "./pages/shelf";
import { scrapeTag } from "./pages/tag";
import type { Context } from "./types";

enum Types {
  List = 'list',
  Search = 'search',
  Shelf = 'shelf',
  Tag = 'tag',
}

const [,, type = '', input, input2] = process.argv;
const fileName = createResultFile(type, input, input2);
const db = createDatabase(fileName);
const ctx: Context = {
  db,
  logger: createLogger(fileName),
  prefix: type.toUpperCase(),
};

try {
  switch (type.toLowerCase()) {
    case Types.List:
      await scrapeList(ctx, input);
      break;

    case Types.Search:
      await scrapeSearch(ctx, input);
      break;

    case Types.Shelf:
      if (!input2) {
        throw new Error('Missing shelf parameter');
      }

      await scrapeShelf(ctx, input, input2);
      break;

    case Types.Tag:
      await scrapeTag(ctx, input, input2);
      break;

    default:
      console.error('Unknown scrape type: ' + type);
  }
} finally {
  ctx.logger.close();
}
