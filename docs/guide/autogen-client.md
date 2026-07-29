# AutoGen Client

The CLI tool generates a fully typed client from your schema definition — no manual adapter or Database wiring required.

## CLI Usage

```sh
open-sheets-orm generate --schema ./schema.ts --output ./generated/client.ts
```

| Flag       | Default                 | Description                          |
| ---------- | ----------------------- | ------------------------------------ |
| `--schema` | `./schema.ts`           | Path to your schema file             |
| `--output` | `./generated/client.ts` | Output path for the generated client |

The schema file must have a **default export** that is a compiled schema object (the result of calling `schema()`):

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

## What Gets Generated

Running the CLI produces a single TypeScript file containing:

### 1. Interfaces

TypeScript interfaces for each model, with correct types mapped from field definitions:

```ts
export interface User {
  id: string;
  email: string;
  name?: string;
  age?: number;
}

export interface Post {
  id: string;
  title: string;
  body?: string;
  published?: boolean;
}
```

### 2. Delegate Classes

One delegate per model with typed CRUD methods:

```ts
export class UserDelegate {
  constructor(private db: Database) {}

  async findMany(opts?: {
    where?: Partial<User>;
    skip?: number;
    limit?: number;
  }): Promise<User[]> {
    return this.db.findMany<User>('User', opts);
  }

  async findUnique(where: { id: string }): Promise<User | null> {
    return this.db.findUnique<User>('User', where);
  }

  async create(args: {
    data: Omit<User, 'id'> & { id?: string };
  }): Promise<User> {
    return this.db.create<User>('User', args.data);
  }

  async update(args: {
    where: { id: string };
    data: Partial<User>;
  }): Promise<User> {
    return this.db.update<User>('User', args.where, args.data);
  }

  async delete(where: { id: string }): Promise<void> {
    return this.db.delete('User', where);
  }
}
```

### 3. Client Class

A `SheetORMClient` class that wires everything together:

```ts
export class SheetORMClient {
  private adapter: GoogleSheetsAdapter;
  private db!: Database;

  public user!: UserDelegate;
  public post!: PostDelegate;

  constructor(config: ClientInitializerGoogle) {
    this.adapter = new GoogleSheetsAdapter(
      config.credentials,
      config.sheetId,
      config.sheetName,
    );
    this.db = new Database(_schema, this.adapter);
  }

  async connect(): Promise<void> {
    await this.adapter.connect();
    this.user = new UserDelegate(this.db);
    this.post = new PostDelegate(this.db);
  }
}
```

## Using the Generated Client

```ts
import { SheetORMClient } from './generated/client';
// Import your credentials file
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

## Configuration Type

The generated client uses `ClientInitializerGoogle` for configuration:

```ts
interface ClientInitializerGoogle {
  credentials: Auth.JWTInput; // Google service account JSON
  sheetId: string; // Spreadsheet ID
  sheetName?: string; // Default sheet name
  provider: 'google'; // Must be "google"
}
```

## Key Differences from Manual API

| Feature           | Manual API                        | AutoGen Client                                  |
| ----------------- | --------------------------------- | ----------------------------------------------- |
| Setup             | Wire adapter + Database manually  | Single `SheetORMClient` class                   |
| Type safety       | Generic `Record<string, unknown>` | Model-specific interfaces                       |
| Method signatures | String model names                | Dot-notation delegates (`client.user.findMany`) |
| Schema            | Passed to `Database` constructor  | Embedded in generated file                      |
