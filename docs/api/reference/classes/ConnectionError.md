Defined in: [errors/index.ts:23](https://github.com/luisdlpr/open-sheets-orm/blob/c84008df19a5b68ec49cf1f996007eb10eca1f41/src/errors/index.ts#L23)

Thrown when the adapter fails to authenticate or establish a connection
with the underlying spreadsheet API.

## Extends

- [`SheetsError`](SheetsError.md)

## Constructors

### Constructor

> **new ConnectionError**(`message`, `options?`): `ConnectionError`

Defined in: [errors/index.ts:24](https://github.com/luisdlpr/open-sheets-orm/blob/c84008df19a5b68ec49cf1f996007eb10eca1f41/src/errors/index.ts#L24)

#### Parameters

##### message

`string`

##### options?

`ErrorOptions`

#### Returns

`ConnectionError`

#### Overrides

[`SheetsError`](SheetsError.md).[`constructor`](SheetsError.md#constructor)
