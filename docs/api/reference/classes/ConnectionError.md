Defined in: [errors/index.ts:23](https://github.com/luisdlpr/open-sheets-orm/blob/737579583cde5a6b2cf0aa3137f06fd3bc88edd4/src/errors/index.ts#L23)

Thrown when the adapter fails to authenticate or establish a connection
with the underlying spreadsheet API.

## Extends

- [`SheetsError`](SheetsError.md)

## Constructors

### Constructor

> **new ConnectionError**(`message`, `options?`): `ConnectionError`

Defined in: [errors/index.ts:24](https://github.com/luisdlpr/open-sheets-orm/blob/737579583cde5a6b2cf0aa3137f06fd3bc88edd4/src/errors/index.ts#L24)

#### Parameters

##### message

`string`

##### options?

`ErrorOptions`

#### Returns

`ConnectionError`

#### Overrides

[`SheetsError`](SheetsError.md).[`constructor`](SheetsError.md#constructor)
