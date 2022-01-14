import { createWriteStream } from 'fs';

export const createLogger = (filename: string) => {
  const stream = createWriteStream(`${filename}.log`, { flags: 'a' });

  return {
    log(line: string) {
      console.log(line);
      stream.write(`${line}\n`);
    },

    close() {
      stream.end();
    }
  }
}
