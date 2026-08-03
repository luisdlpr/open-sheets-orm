Defined in: [errors/index.ts:12](https://github.com/luisdlpr/open-sheets-orm/blob/b50fe8438de73b0de53dd34a9540e071c2513479/src/errors/index.ts#L12)

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

Defined in: [errors/index.ts:13](https://github.com/luisdlpr/open-sheets-orm/blob/b50fe8438de73b0de53dd34a9540e071c2513479/src/errors/index.ts#L13)

#### Parameters

##### message

`string`

##### options?

`ErrorOptions`

#### Returns

`SheetsError`

#### Overrides

`Error.constructor`
