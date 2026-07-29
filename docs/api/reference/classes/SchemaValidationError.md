Defined in: [schema/errors.ts:12](https://github.com/luisdlpr/open-sheets-orm/blob/737579583cde5a6b2cf0aa3137f06fd3bc88edd4/src/schema/errors.ts#L12)

Thrown when a schema definition violates a validation rule.

Lives in a separate domain from `SheetsError` — schema validation
is a pure compile-time concern with no I/O.

## Extends

- `Error`

## Constructors

### Constructor

> **new SchemaValidationError**(`message`): `SchemaValidationError`

Defined in: [schema/errors.ts:15](https://github.com/luisdlpr/open-sheets-orm/blob/737579583cde5a6b2cf0aa3137f06fd3bc88edd4/src/schema/errors.ts#L15)

#### Parameters

##### message

`string`

#### Returns

`SchemaValidationError`

#### Overrides

`Error.constructor`

## Properties

### name

> **name**: `"SchemaValidationError"`

Defined in: [schema/errors.ts:13](https://github.com/luisdlpr/open-sheets-orm/blob/737579583cde5a6b2cf0aa3137f06fd3bc88edd4/src/schema/errors.ts#L13)

#### Overrides

`Error.name`
