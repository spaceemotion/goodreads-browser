import { createDatabase } from "./db";
import { scrapeList } from "./pages/list";
import { scrapeSearch } from "./pages/search";
import { scrapeShelf } from "./pages/shelf";
import { scrapeTag } from "./pages/tag";

enum Types {
  List = 'list',
  Search = 'search',
  Shelf = 'shelf',
  Tag = 'tag',
}

const [,, type, input, input2] = process.argv;
const db = createDatabase(type, input, input2);

switch (type.toLowerCase()) {
  case Types.List:
    await scrapeList(db, input);
    break;

  case Types.Search:
    await scrapeSearch(db, input);
    break;

  case Types.Shelf:
    if (!input2) {
      throw new Error('Missing shelf parameter');
    }

    await scrapeShelf(db, input, input2);
    break;

  case Types.Tag:
    await scrapeTag(db, input, input2);
    break;

  default:
    console.error('Unknown scrape type: ' + type);
}
