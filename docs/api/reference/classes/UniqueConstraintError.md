Defined in: [query/errors.ts:33](https://github.com/luisdlpr/open-sheets-orm/blob/c84008df19a5b68ec49cf1f996007eb10eca1f41/src/query/errors.ts#L33)

Thrown when a create or update operation would violate a uniqueness
constraint on a primary key or unique-flagged field.

## Extends

- [`SheetsError`](SheetsError.md)

## Constructors

### Constructor

> **new UniqueConstraintError**(`modelName`, `fieldName`, `value`): `UniqueConstraintError`

Defined in: [query/errors.ts:34](https://github.com/luisdlpr/open-sheets-orm/blob/c84008df19a5b68ec49cf1f996007eb10eca1f41/src/query/errors.ts#L34)

#### Parameters

##### modelName

`string`

##### fieldName

`string`

##### value

`unknown`

#### Returns

`UniqueConstraintError`

#### Overrides

[`SheetsError`](SheetsError.md).[`constructor`](SheetsError.md#constructor)
