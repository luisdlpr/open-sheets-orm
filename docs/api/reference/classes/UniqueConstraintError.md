Defined in: [query/errors.ts:33](https://github.com/luisdlpr/open-sheets-orm/blob/b50fe8438de73b0de53dd34a9540e071c2513479/src/query/errors.ts#L33)

Thrown when a create or update operation would violate a uniqueness
constraint on a primary key or unique-flagged field.

## Extends

- [`SheetsError`](SheetsError.md)

## Constructors

### Constructor

> **new UniqueConstraintError**(`modelName`, `fieldName`, `value`): `UniqueConstraintError`

Defined in: [query/errors.ts:34](https://github.com/luisdlpr/open-sheets-orm/blob/b50fe8438de73b0de53dd34a9540e071c2513479/src/query/errors.ts#L34)

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
