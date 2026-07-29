Defined in: [errors/index.ts:12](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/errors/index.ts#L12)

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

Defined in: [errors/index.ts:13](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/errors/index.ts#L13)

#### Parameters

##### message

`string`

##### options?

`ErrorOptions`

#### Returns

`SheetsError`

#### Overrides

`Error.constructor`
