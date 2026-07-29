Defined in: [errors/index.ts:23](https://github.com/luisdlpr/open-sheets-orm/blob/c8776ff3a88bbdbacb7986a611baa102a7127cb1/src/errors/index.ts#L23)

Thrown when the adapter fails to authenticate or establish a connection
with the underlying spreadsheet API.

## Extends

- [`SheetsError`](SheetsError.md)

## Constructors

### Constructor

> **new ConnectionError**(`message`, `options?`): `ConnectionError`

Defined in: [errors/index.ts:24](https://github.com/luisdlpr/open-sheets-orm/blob/c8776ff3a88bbdbacb7986a611baa102a7127cb1/src/errors/index.ts#L24)

#### Parameters

##### message

`string`

##### options?

`ErrorOptions`

#### Returns

`ConnectionError`

#### Overrides

[`SheetsError`](SheetsError.md).[`constructor`](SheetsError.md#constructor)
