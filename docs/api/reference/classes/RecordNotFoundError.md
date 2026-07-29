Defined in: [query/errors.ts:46](https://github.com/luisdlpr/open-sheets-orm/blob/5a2a5c89c5610683f4e2824d4b521a13ad1211d8/src/query/errors.ts#L46)

Thrown when a query operation cannot find a record matching
the supplied where clause.

## Extends

- [`SheetsError`](SheetsError.md)

## Constructors

### Constructor

> **new RecordNotFoundError**(`modelName`, `where`): `RecordNotFoundError`

Defined in: [query/errors.ts:47](https://github.com/luisdlpr/open-sheets-orm/blob/5a2a5c89c5610683f4e2824d4b521a13ad1211d8/src/query/errors.ts#L47)

#### Parameters

##### modelName

`string`

##### where

`Record`\<`string`, `unknown`\>

#### Returns

`RecordNotFoundError`

#### Overrides

[`SheetsError`](SheetsError.md).[`constructor`](SheetsError.md#constructor)
