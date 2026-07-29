# open-sheets-orm

[![npm version](https://img.shields.io/npm/v/open-sheets-orm.svg)](https://www.npmjs.com/package/open-sheets-orm)
[![license](https://img.shields.io/npm/l/open-sheets-orm.svg)](https://github.com/luisdlpr/open-sheets-orm/blob/main/LICENSE)
[![typescript](https://img.shields.io/badge/typescript-5.7-blue.svg)](https://www.typescriptlang.org/)

A type-safe ORM for Google Sheets with a Prisma-inspired developer experience.

## Features

- **Schema-first approach** — Define your data models with a fluent, type-safe API
- **Automatic type coercion** — String values from sheets are automatically parsed to numbers, booleans, dates, and JSON
- **Query engine** — `findMany`, `findUnique`, `create`, `update`, and `delete` operations
- **Uniqueness constraints** — Primary key and unique field enforcement
- **Validation** — Input validation with clear error messages
- **Pluggable adapters** — Abstract adapter layer for future spreadsheet providers
- **CLI code generation** — Generate a fully typed client from your schema with one command

## Installation

```sh
npm install open-sheets-orm
```

```sh
pnpm add open-sheets-orm
```

```sh
yarn add open-sheets-orm
```

## Quick Start

### 1. Define your schema

```ts
import { schema, field } from 'open-sheets-orm';

const mySchema = schema({
  User: {
    id: field.string().primaryKey(),
    email: field.string().unique(),
    name: field.string(),
    age: field.number().optional(),
    active: field.boolean().default(true),
    metadata: field.json().optional(),
  },
});
```

### 2. Connect to Google Sheets

```ts
import { GoogleSheetsAdapter } from 'open-sheets-orm';

const adapter = new GoogleSheetsAdapter(
  credentials,   // Google service account credentials (JWT)
  'spreadsheet-id',
);
await adapter.connect();
```

### 3. Query your data

```ts
import { Database } from 'open-sheets-orm';

const db = new Database(mySchema, adapter);

// Create a record
await db.create('User', {
  email: 'alice@example.com',
  name: 'Alice',
  age: 30,
});

// Read records
const users = await db.findMany('User');
const alice = await db.findUnique('User', { email: 'alice@example.com' });

// Update a record
await db.update('User', { email: 'alice@example.com' }, { age: 31 });

// Delete a record
await db.delete('User', { email: 'alice@example.com' });
```

## AutoGen Client

The CLI generates a fully typed client from your schema — no manual wiring needed.

### 1. Create a schema file

```ts
// schema.ts
import { schema, field } from 'open-sheets-orm';

const mySchema = schema({
  User: {
    id: field.string().primaryKey(),
    email: field.string().unique(),
    name: field.string(),
    age: field.number().optional(),
  },
});

export default mySchema;
```

### 2. Run the generator

```sh
npx open-sheets-orm generate --schema ./schema.ts --output ./generated/client.ts
```

### 3. Use the generated client

```ts
import { SheetORMClient } from './generated/client';
import credentials from './service-account.json';

const client = new SheetORMClient({
  credentials,
  sheetId: 'your-spreadsheet-id',
  provider: 'google',
});

await client.connect();

// Fully typed CRUD operations
await client.user.create({
  data: { email: 'alice@example.com', name: 'Alice' },
});

const users = await client.user.findMany({
  where: { name: 'Alice' },
  limit: 10,
});

const user = await client.user.findUnique({ id: users[0].id });

await client.user.update({
  where: { id: users[0].id },
  data: { name: 'Updated Name' },
});

await client.user.delete({ id: users[0].id });
```

### What gets generated

| Output | Description |
|--------|-------------|
| Interfaces | One `export interface` per model with correct types |
| Delegates | One class per model with typed `findMany`, `findUnique`, `create`, `update`, `delete` |
| `SheetORMClient` | Wrapper class with dot-notation access (`client.user`, `client.post`) |

### CLI Options

| Flag | Default | Description |
|------|---------|-------------|
| `--schema` | `./schema.ts` | Path to your schema file |
| `--output` | `./generated/client.ts` | Output path for the generated client |

For more details, see the [AutoGen Client guide](https://luisdlpr.github.io/open-sheets-orm/guide/autogen-client).

## Schema Reference

### Field Types

| Type | TypeScript | Description |
|------|-----------|-------------|
| `field.string()` | `string` | Text values |
| `field.number()` | `number` | Numeric values |
| `field.boolean()` | `boolean` | Boolean values (`true`/`false`/`1`/`0`) |
| `field.date()` | `Date` | Date values (parsed via `new Date()`) |
| `field.json()` | `any` | JSON objects or arrays |

### Field Modifiers

| Modifier | Description |
|----------|-------------|
| `.primaryKey()` | Marks field as the primary key (auto-generates UUID if omitted) |
| `.unique()` | Enforces uniqueness across all records |
| `.optional()` | Field may be omitted or empty |
| `.default(value)` | Sets a default value when not provided |

### Query Options

```ts
const results = await db.findMany('User', {
  where: { active: true },   // Filter conditions
  skip: 10,                   // Offset
  limit: 5,                   // Max records to return
});
```

## Google Sheets Setup

1. Create a Google Cloud project and enable the Sheets API
2. Create a service account and download the JSON credentials
3. Share your Google Sheet with the service account email

```ts
import credentials from './service-account.json';

const adapter = new GoogleSheetsAdapter(
  credentials as Auth.JWTInput,
  'your-spreadsheet-id',
);
```

## Documentation

Full documentation is available at [https://luisdlpr.github.io/open-sheets-orm](https://luisdlpr.github.io/open-sheets-orm).

## Development

```sh
git clone https://github.com/luisdlpr/open-sheets-orm.git
cd open-sheets-orm
pnpm install
```

| Command | Description |
|---------|-------------|
| `pnpm dev` | Watch mode |
| `pnpm build` | Build to `dist/` |
| `pnpm test` | Run tests |
| `pnpm lint` | Lint with ESLint |
| `pnpm docs:dev` | Local docs server |

## Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)
