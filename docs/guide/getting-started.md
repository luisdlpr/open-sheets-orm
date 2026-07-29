# Getting Started

## Installation

::: code-group

```sh [npm]
npm install open-sheets-orm
```

```sh [pnpm]
pnpm add open-sheets-orm
```

```sh [yarn]
yarn add open-sheets-orm
```

:::

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
// Import your credentials file
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
  'Users', // Sheet name (optional, defaults to first sheet)
);
await adapter.connect();

// 3. Create the query engine
const db = new Database(mySchema, adapter);

// 4. Start querying
await db.create('User', { email: 'alice@example.com', name: 'Alice' });
const users = await db.findMany('User');
const alice = await db.findUnique('User', { email: 'alice@example.com' });
```

## Project Structure

open-sheets-orm has three layers:

| Layer        | Purpose                                                                  |
| ------------ | ------------------------------------------------------------------------ |
| **Schema**   | Define models and field types using `field` and `schema()`               |
| **Database** | Query engine with `findMany`, `findUnique`, `create`, `update`, `delete` |
| **Adapter**  | I/O boundary — `GoogleSheetsAdapter` handles Google Sheets API calls     |

You can use the adapter directly for low-level spreadsheet operations, or use the `Database` class for ORM-style queries with schema validation and type coercion.

## What's Next

- [Manual API Usage](./manual-api.md) — Detailed guide to schemas, adapters, and the query engine
- [AutoGen Client](./autogen-client.md) — Generate a typed client from your schema
- [API Reference](../api/reference/) — Full TypeScript API documentation
