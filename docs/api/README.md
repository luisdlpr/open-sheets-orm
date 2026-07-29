# open-sheets-orm

A type-safe ORM for Google Sheets with a Prisma-inspired developer experience.

> **Early stage** — this project is under active development and the API is not yet stable.

## Installation

```sh
pnpm add open-sheets-orm
```

Also available via npm and yarn.

## Setup

```ts
import { GoogleSheetsAdapter } from 'open-sheets-orm';

const adapter = new GoogleSheetsAdapter({
  // Google Sheets API credentials
});
```

## Development

```sh
pnpm install
pnpm dev        # watch mode
pnpm build      # build
pnpm test       # run tests
pnpm lint       # lint
```

## License

MIT
