# Manual API Usage

This guide covers using open-sheets-orm directly — defining schemas, working with the adapter, and querying with the Database class.

## Schema Definition

Schemas describe your data models using a fluent builder API.

```ts
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
    createdAt: field.date().optional(),
    metadata: field.json().optional(),
  },
});
```

### Field Types

| Factory | TypeScript Type | Cell Parsing |
|---|---|---|
| `field.string()` | `string` | Raw string value |
| `field.number()` | `number` | `Number(value)` |
| `field.boolean()` | `boolean` | `true` if value is `"true"`, `"TRUE"`, or `"1"` |
| `field.date()` | `Date` | `new Date(value)` |
| `field.json()` | `unknown` | `JSON.parse(value)` |

### Field Modifiers

| Modifier | Effect |
|---|---|
| `.primaryKey()` | Marks as the primary key. Auto-generates a UUID on `create` if omitted from input. Enforces uniqueness. |
| `.unique()` | Enforces uniqueness across all rows on `create` and `update`. |
| `.optional()` | Field is not required on create. |
| `.default(value)` | Used when the field is omitted from input data. |

## Adapter (Low-Level)

The adapter provides direct spreadsheet operations without schema validation.

### GoogleSheetsAdapter

```ts
import { GoogleSheetsAdapter } from 'open-sheets-orm';

const adapter = new GoogleSheetsAdapter(
  credentials,      // Auth.JWTInput — service account JSON
  'spreadsheet-id', // Target spreadsheet ID
  'Sheet1',         // Default sheet name (optional)
);
await adapter.connect();
```

### Row Operations

```ts
// Read all rows (returns objects keyed by headers)
const rows = await adapter.readSheet<User>();

// Append a new row
await adapter.appendRow(['1', 'Alice', 'alice@example.com']);

// Update a row by index (0-based, first data row = index 0)
await adapter.updateRow(0, ['1', 'Alice Updated', 'alice@example.com']);

// Delete a row by index
await adapter.deleteRow(0);
```

### Sheet Management

```ts
// Get spreadsheet metadata
const info = await adapter.getSpreadsheet();
console.log(info.title, info.sheets);

// Create a new sheet
await adapter.createSheet('NewTab');

// Ensure a sheet exists (no-op if already present)
await adapter.ensureSheet('NewTab');

// Delete a sheet
await adapter.deleteSheet('NewTab');

// Read/write headers
const headers = await adapter.getHeaders('Sheet1');
await adapter.writeHeaders(['id', 'name', 'email'], 'Sheet1');
```

### Disconnect

```ts
await adapter.disconnect();
```

## Database (Query Engine)

The `Database` class provides ORM-style queries with schema validation, type coercion, and uniqueness enforcement.

```ts
import { Database } from 'open-sheets-orm';

const db = new Database(mySchema, adapter);
```

### findMany

Retrieve all records with optional filtering and pagination.

```ts
// All records
const users = await db.findMany('User');

// With filtering (all conditions must match)
const alices = await db.findMany('User', {
  where: { name: 'Alice' },
});

// With pagination
const page = await db.findMany('User', {
  where: { name: 'Alice' },
  skip: 10,
  limit: 5,
});
```

### findUnique

Find a single record by field values. Throws `RecordNotFoundError` if no match is found.

```ts
import { RecordNotFoundError } from 'open-sheets-orm';

try {
  const user = await db.findUnique('User', { id: '123' });
} catch (e) {
  if (e instanceof RecordNotFoundError) {
    console.log('User not found');
  }
}
```

### create

Insert a new record. Primary keys are auto-generated (UUID) if omitted. Default values are applied for missing fields.

```ts
// Auto-generate ID
const user = await db.create('User', {
  email: 'bob@example.com',
  name: 'Bob',
});
console.log(user.id); // auto-generated UUID

// Provide explicit ID
const user2 = await db.create('User', {
  id: 'custom-id',
  email: 'carol@example.com',
});
```

Throws `UniqueConstraintError` if a `primaryKey` or `unique` field value already exists.

### update

Update a record matching the where clause. Throws `RecordNotFoundError` if no match is found.

```ts
import { UniqueConstraintError } from 'open-sheets-orm';

try {
  const updated = await db.update(
    'User',
    { id: '123' },
    { name: 'New Name' },
  );
} catch (e) {
  if (e instanceof UniqueConstraintError) {
    console.log('Unique constraint violated');
  }
}
```

### delete

Delete a record matching the where clause. Throws `RecordNotFoundError` if no match is found.

```ts
await db.delete('User', { id: '123' });
```

## Error Handling

All domain errors extend `SheetsError`:

| Error | When |
|---|---|
| `ConnectionError` | Adapter method called before `connect()` |
| `SheetNotFoundError` | Referenced sheet does not exist |
| `RowNotFoundError` | Row index is out of bounds |
| `ModelNotFoundError` | Model name not in schema |
| `RecordNotFoundError` | No record matches the where clause |
| `UniqueConstraintError` | Duplicate PK/unique field value |
| `ValidationError` | Required field missing or type mismatch |
| `SchemaValidationError` | Invalid schema definition |

```ts
import {
  SheetsError,
  ConnectionError,
  ModelNotFoundError,
  UniqueConstraintError,
} from 'open-sheets-orm';
```
