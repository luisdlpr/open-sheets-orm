Defined in: [errors/index.ts:44](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/errors/index.ts#L44)

Thrown when a row operation targets a row index that does not exist
or contains no data.

## Extends

- [`SheetsError`](SheetsError.md)

## Constructors

### Constructor

> **new RowNotFoundError**(`rowIndex`): `RowNotFoundError`

Defined in: [errors/index.ts:45](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/errors/index.ts#L45)

#### Parameters

##### rowIndex

`number`

#### Returns

`RowNotFoundError`

#### Overrides

[`SheetsError`](SheetsError.md).[`constructor`](SheetsError.md#constructor)
