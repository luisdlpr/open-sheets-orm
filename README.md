# open-sheets-orm

[![npm version](https://img.shields.io/npm/v/open-sheets-orm.svg)](https://www.npmjs.com/package/open-sheets-orm)
[![license](https://img.shields.io/npm/l/open-sheets-orm.svg)](https://github.com/luisdlpr/open-sheets-orm/blob/main/LICENSE)
[![typescript](https://img.shields.io/badge/typescript-5.7-blue.svg)](https://www.typescriptlang.org/)

A type-safe ORM for Google Sheets with a Prisma-inspired developer experience.

**A quick gotcha for the purists:** this is technically clickbait. There's no relational database here, so "ORM" is a stretch. An "Object Sheet Mapper" (OSM) would be more accurate — but let's be honest, nobody would know what that means. We went with ORM because it instantly communicates the dev experience: define a schema, run queries, get typed results. Same vibes, different grid.

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

## Google Sheets Setup

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. Enable the **Google Sheets API** under _APIs & Services > Library_.

### 2. Create a Service Account

1. Go to _APIs & Services > Credentials_.
2. Click **Create Credentials > Service Account**.
3. Fill in a name and click **Done**.
4. Under the new service account, go to the **Keys** tab.
5. Click **Add Key > Create new key > JSON**.
6. Download and save the JSON file securely.

### 3. Share Your Spreadsheet

Open the Google Spreadsheet you want to use and share it with the **client email** from the service account JSON (found under `client_email`). Give it **Editor** access.

## Quick Start

```ts
import { schema, field, Database, GoogleSheetsAdapter } from 'open-sheets-orm';
import credentials from 'path/to/creds.json';

// 1. Define your schema
const mySchema = schema({
  User: {
    id: field.string().primaryKey(),
    email: field.string().unique(),
    name: field.string().optional(),
    age: field.number().optional().default(0),
  },
});

// 2. Create the adapter and connect
const adapter = new GoogleSheetsAdapter(
  credentials, // Service account JSON (Auth.JWTInput)
  'spreadsheet-id', // The ID from your spreadsheet URL
);
await adapter.connect();

// 3. Create the query engine
const db = new Database(mySchema, adapter);

// 4. Start querying
await db.create('User', { email: 'alice@example.com', name: 'Alice' });
const users = await db.findMany('User');
const alice = await db.findUnique('User', { email: 'alice@example.com' });
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
    name: field.string().optional(),
    age: field.number().optional().default(0),
  },
  Post: {
    id: field.string().primaryKey(),
    title: field.string(),
    body: field.string().optional(),
    published: field.boolean().default(false),
  },
});

export default mySchema;
```

### 2. Run the generator

```sh
open-sheets-orm generate --schema ./schema.ts --output ./generated/client.ts
```

### 3. Use the generated client

```ts
import { SheetORMClient } from './generated/client';
import credentials from 'path/to/creds.json';

const client = new SheetORMClient({
  credentials,
  sheetId: 'your-spreadsheet-id',
  provider: 'google',
});

await client.connect();

// CRUD via typed delegates
await client.user.create({
  data: { email: 'alice@example.com', name: 'Alice' },
});

const users = await client.user.findMany({
  where: { name: 'Alice' },
  limit: 10,
});

const id = users[0].id;

const user = await client.user.findUnique({ id });

await client.user.update({
  where: { id },
  data: { name: 'Updated Name' },
});

await client.user.delete({ id });

// Same pattern for other models
await client.post.create({
  data: { title: 'Hello World', body: 'My first post' },
});

const posts = await client.post.findMany({
  where: { published: true },
});
```

### What gets generated

| Output           | Description                                                                           |
| ---------------- | ------------------------------------------------------------------------------------- |
| Interfaces       | One `export interface` per model with correct types                                   |
| Delegates        | One class per model with typed `findMany`, `findUnique`, `create`, `update`, `delete` |
| `SheetORMClient` | Wrapper class with dot-notation access (`client.user`, `client.post`)                 |

### CLI Options

| Flag       | Default                 | Description                          |
| ---------- | ----------------------- | ------------------------------------ |
| `--schema` | `./schema.ts`           | Path to your schema file             |
| `--output` | `./generated/client.ts` | Output path for the generated client |

For more details, see the [AutoGen Client guide](https://luisdlpr.github.io/open-sheets-orm/guide/autogen-client).

## Schema Reference

### Field Types

| Factory           | TypeScript Type | Cell Parsing                                    |
| ----------------- | --------------- | ----------------------------------------------- |
| `field.string()`  | `string`        | Raw string value                                |
| `field.number()`  | `number`        | `Number(value)`                                 |
| `field.boolean()` | `boolean`       | `true` if value is `"true"`, `"TRUE"`, or `"1"` |
| `field.date()`    | `Date`          | `new Date(value)`                               |
| `field.json()`    | `unknown`       | `JSON.parse(value)`                             |

### Field Modifiers

| Modifier          | Effect                                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| `.primaryKey()`   | Marks as the primary key. Auto-generates a UUID on `create` if omitted from input. Enforces uniqueness. |
| `.unique()`       | Enforces uniqueness across all rows on `create` and `update`.                                           |
| `.optional()`     | Field is not required on create.                                                                        |
| `.default(value)` | Used when the field is omitted from input data.                                                         |

### Query Options

```ts
const results = await db.findMany('User', {
  where: { active: true }, // Filter conditions
  skip: 10, // Offset
  limit: 5, // Max records to return
});
```

## Documentation

Full documentation is available at [https://luisdlpr.github.io/open-sheets-orm](https://luisdlpr.github.io/open-sheets-orm).

## Development

```sh
git clone https://github.com/luisdlpr/open-sheets-orm.git
cd open-sheets-orm
pnpm install
```

| Command         | Description       |
| --------------- | ----------------- |
| `pnpm dev`      | Watch mode        |
| `pnpm build`    | Build to `dist/`  |
| `pnpm test`     | Run tests         |
| `pnpm lint`     | Lint with ESLint  |
| `pnpm docs:dev` | Local docs server |

## Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.

## License

[MIT](https://github.com/luisdlpr/open-sheets-orm/blob/docs/readme/LICENSE)
