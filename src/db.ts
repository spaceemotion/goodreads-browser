import { Low, JSONFile } from 'lowdb';
import type { Database, DatabaseContents } from "./types";

export function createDatabase(...prefix: string[]): Database {
  const rand = Math.random().toString(16).substring(2, 10); // 6de5ccda
  const fileName = `./results/${prefix.filter((t) => !!t).join('-')}-${rand}.json`;
  const adapter = new JSONFile<DatabaseContents>(fileName);

  console.log(`Writing to ${fileName}`);

  return new Low(adapter);
}
