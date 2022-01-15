import { createWriteStream } from 'fs';
import type { Logger } from './types';

export const createLogger = (filename: string): Logger => {
  const stream = createWriteStream(`${filename}.log`, { flags: 'a' });

  return {
    log(line: string) {
      const prefix = `${(new Date()).toISOString()}: `;
      console.log(prefix + line);
      stream.write(`${prefix}${line}\n`);
    },

    close() {
      stream.end();
    }
  }
}
