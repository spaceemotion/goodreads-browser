import { Low, JSONFile } from 'lowdb';
import type { Database, DatabaseContents } from "./types";

export const createResultFile = (...prefix: string[]): string => {
  const rand = Math.random().toString(16).substring(2, 10); // 6de5ccda

  return `./results/${prefix.filter((t) => !!t).join('-')}-${rand}`;
}

export function createDatabase(fileName: string): Database {
  const adapter = new JSONFile<DatabaseContents>(`${fileName}.json`);

  console.log(`Writing to ${fileName}`);

  return new Low(adapter);
}
