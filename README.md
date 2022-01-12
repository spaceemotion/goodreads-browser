# Goodreads Browser
Custom crawler and interface providing sort and filter options for the goodreads database.

Page types supported:
- Lists
- Regular search
- Shelves
- Tags (global Shelves, requires session cookie ID)

(Private profiles cannot be crawled, obviously)

## Usage
Crawl the site using the following command(s):

```bash
npm run start <type> <arg1> <arg2>

npm run start list <id>
npm run start shelf <userId> <shelfName>
npm run start tag <name> <sessionCookieId>
npm run start search <name>
```

## Open the browser
![Browser](/img/browser-screenshot.jpg)

```bash
cd gr-search && yarn run dev
```

Will start the browser on `localhost:3000`.

Load the generated database files from `results/` using the "Database" field (multiple files supported).
