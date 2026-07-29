Defined in: [query/Database.ts:28](https://github.com/luisdlpr/open-sheets-orm/blob/c8776ff3a88bbdbacb7986a611baa102a7127cb1/src/query/Database.ts#L28)

High-level query engine that translates ORM-style operations into
adapter-level spreadsheet operations.

## Example

```ts
const db = new Database(schema, adapter);
const users = await db.findMany('User');
const user = await db.findUnique('User', { id: '1' });
```

## Constructors

### Constructor

> **new Database**(`schema`, `adapter`): `Database`

Defined in: [query/Database.ts:36](https://github.com/luisdlpr/open-sheets-orm/blob/c8776ff3a88bbdbacb7986a611baa102a7127cb1/src/query/Database.ts#L36)

#### Parameters

##### schema

[`SchemaMetadata`](../interfaces/SchemaMetadata.md)

The compiled schema definition containing model metadata.

##### adapter

[`SheetsAdapter`](SheetsAdapter.md)

The sheets adapter used for low-level spreadsheet I/O.

#### Returns

`Database`

## Methods

### create()

> **create**\<`T`\>(`modelName`, `data`): `Promise`\<`T`\>

Defined in: [query/Database.ts:115](https://github.com/luisdlpr/open-sheets-orm/blob/c8776ff3a88bbdbacb7986a611baa102a7127cb1/src/query/Database.ts#L115)

Creates a new record in the given model.

#### Type Parameters

##### T

`T` = `Record`\<`string`, `unknown`\>

#### Parameters

##### modelName

`string`

The name of the model to insert into.

##### data

`Record`\<`string`, `unknown`\>

The field values for the new record.

#### Returns

`Promise`\<`T`\>

The created record with any applied defaults.

***

### delete()

> **delete**(`modelName`, `where`): `Promise`\<`void`\>

Defined in: [query/Database.ts:226](https://github.com/luisdlpr/open-sheets-orm/blob/c8776ff3a88bbdbacb7986a611baa102a7127cb1/src/query/Database.ts#L226)

Deletes a record matching the given where clause.

#### Parameters

##### modelName

`string`

The name of the model to delete from.

##### where

[`WhereClause`](../type-aliases/WhereClause.md)

Field-value pairs identifying the record.

#### Returns

`Promise`\<`void`\>

#### Throws

If no record matches the where clause.

***

### findMany()

> **findMany**\<`T`\>(`modelName`, `options?`): `Promise`\<`T`[]\>

Defined in: [query/Database.ts:50](https://github.com/luisdlpr/open-sheets-orm/blob/c8776ff3a88bbdbacb7986a611baa102a7127cb1/src/query/Database.ts#L50)

Retrieves all records for the given model, with optional filtering
and pagination.

#### Type Parameters

##### T

`T` = `Record`\<`string`, `unknown`\>

#### Parameters

##### modelName

`string`

The name of the model to query.

##### options?

[`FindManyOptions`](../interfaces/FindManyOptions.md)

Optional filtering and pagination options.

#### Returns

`Promise`\<`T`[]\>

An array of record objects keyed by field names.

#### Throws

If the model does not exist in the schema.

***

### findUnique()

> **findUnique**\<`T`\>(`modelName`, `where`): `Promise`\<`T`\>

Defined in: [query/Database.ts:86](https://github.com/luisdlpr/open-sheets-orm/blob/c8776ff3a88bbdbacb7986a611baa102a7127cb1/src/query/Database.ts#L86)

Finds a single record matching the given where clause.

#### Type Parameters

##### T

`T` = `Record`\<`string`, `unknown`\>

#### Parameters

##### modelName

`string`

The name of the model to query.

##### where

[`WhereClause`](../type-aliases/WhereClause.md)

Field-value pairs identifying the record.

#### Returns

`Promise`\<`T`\>

The matching record.

#### Throws

If no record matches the where clause.

***

### update()

> **update**\<`T`\>(`modelName`, `where`, `data`): `Promise`\<`T`\>

Defined in: [query/Database.ts:179](https://github.com/luisdlpr/open-sheets-orm/blob/c8776ff3a88bbdbacb7986a611baa102a7127cb1/src/query/Database.ts#L179)

Updates a record matching the given where clause.

#### Type Parameters

##### T

`T` = `Record`\<`string`, `unknown`\>

#### Parameters

##### modelName

`string`

The name of the model to update.

##### where

[`WhereClause`](../type-aliases/WhereClause.md)

Field-value pairs identifying the record.

##### data

`Record`\<`string`, `unknown`\>

The field values to update.

#### Returns

`Promise`\<`T`\>

The updated record.

#### Throws

If no record matches the where clause.
