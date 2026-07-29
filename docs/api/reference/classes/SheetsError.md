Defined in: [errors/index.ts:12](https://github.com/luisdlpr/open-sheets-orm/blob/c84008df19a5b68ec49cf1f996007eb10eca1f41/src/errors/index.ts#L12)

Base error class for all sheets adapter errors.

All domain-specific errors extend this class, allowing callers
to catch all adapter errors with a single `instanceof` check.

## Extends

- `Error`

## Extended by

- [`ConnectionError`](ConnectionError.md)
- [`SheetNotFoundError`](SheetNotFoundError.md)
- [`RowNotFoundError`](RowNotFoundError.md)
- [`ModelNotFoundError`](ModelNotFoundError.md)
- [`RecordNotFoundError`](RecordNotFoundError.md)
- [`UniqueConstraintError`](UniqueConstraintError.md)
- [`ValidationError`](ValidationError.md)

## Constructors

### Constructor

> **new SheetsError**(`message`, `options?`): `SheetsError`

Defined in: [errors/index.ts:13](https://github.com/luisdlpr/open-sheets-orm/blob/c84008df19a5b68ec49cf1f996007eb10eca1f41/src/errors/index.ts#L13)

#### Parameters

##### message

`string`

##### options?

`ErrorOptions`

#### Returns

`SheetsError`

#### Overrides

`Error.constructor`
