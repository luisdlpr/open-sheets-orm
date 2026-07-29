Defined in: [adapters/SheetsAdapter.ts:23](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L23)

Abstract base class defining the contract for sheets adapter implementations.

Subclasses must implement all abstract methods to provide
concrete spreadsheet operations (connection, metadata, sheet management,
and row-level CRUD).

## Example

```ts
const adapter = new GoogleSheetsAdapter(credentials, 'id');
await adapter.connect();
const data = await adapter.readSheet<MyRow>();
```

## Extended by

- [`GoogleSheetsAdapter`](GoogleSheetsAdapter.md)

## Constructors

### Constructor

> **new SheetsAdapter**(`config`): `SheetsAdapter`

Defined in: [adapters/SheetsAdapter.ts:39](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L39)

#### Parameters

##### config

[`SheetConfig`](../interfaces/SheetConfig.md)

Configuration identifying the target spreadsheet
and optional default sheet name.

#### Returns

`SheetsAdapter`

## Properties

### \_connected

> `protected` **\_connected**: `boolean` = `false`

Defined in: [adapters/SheetsAdapter.ts:33](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L33)

Whether the adapter has been successfully connected.

Set to `true` by [connect](#connect) and `false` by [disconnect](#disconnect).
Checked in [ensureConnected](#ensureconnected) before every data operation.

---

### config

> `protected` **config**: [`SheetConfig`](../interfaces/SheetConfig.md)

Defined in: [adapters/SheetsAdapter.ts:25](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L25)

The spreadsheet configuration for this adapter instance.

## Methods

### appendRow()

> `abstract` **appendRow**(`row`, `sheetName?`): `Promise`\<`void`>>>>>>>\>

Defined in: [adapters/SheetsAdapter.ts:151](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L151)

Appends a new row after the last existing row in the sheet.

#### Parameters

##### row

`unknown`[]

The cell values for the new row.

##### sheetName?

`string`

The target sheet. When omitted, the default
sheet from [SheetConfig](../interfaces/SheetConfig.md) is used.

#### Returns

`Promise`\<`void`\>

---

### connect()

> `abstract` **connect**(): `Promise`\<`void`>>>>>>>\>

Defined in: [adapters/SheetsAdapter.ts:49](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L49)

Establishes a connection with the underlying spreadsheet API.

Must be called before any other method. Implementations should
initialize authentication and any required API clients.

#### Returns

`Promise`\<`void`\>

---

### createSheet()

> `abstract` **createSheet**(`title`): `Promise`\<[`SheetInfo`](../interfaces/SheetInfo.md)>>>>>>>\>

Defined in: [adapters/SheetsAdapter.ts:89](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L89)

Creates a new sheet (tab) within the spreadsheet.

#### Parameters

##### title

`string`

The title for the new sheet. Must be unique within
the spreadsheet.

#### Returns

`Promise`\<[`SheetInfo`](../interfaces/SheetInfo.md)\>

Metadata for the newly created sheet.

---

### deleteRow()

> `abstract` **deleteRow**(`rowIndex`, `sheetName?`): `Promise`\<`void`>>>>>>>\>

Defined in: [adapters/SheetsAdapter.ts:180](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L180)

Deletes a row by its zero-based data index.

Row index 0 refers to the first data row (the row immediately
after the header row). Rows below the deleted row shift up.

#### Parameters

##### rowIndex

`number`

Zero-based index of the row to delete.

##### sheetName?

`string`

The target sheet. When omitted, the default
sheet from [SheetConfig](../interfaces/SheetConfig.md) is used.

#### Returns

`Promise`\<`void`\>

---

### deleteSheet()

> `abstract` **deleteSheet**(`sheetName`): `Promise`\<`void`>>>>>>>\>

Defined in: [adapters/SheetsAdapter.ts:110](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L110)

Deletes a sheet (tab) from the spreadsheet by its title.

#### Parameters

##### sheetName

`string`

The title of the sheet to delete.

#### Returns

`Promise`\<`void`\>

#### Throws

If a sheet with the given name does
not exist.

---

### disconnect()

> `abstract` **disconnect**(): `Promise`\<`void`>>>>>>>\>

Defined in: [adapters/SheetsAdapter.ts:57](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L57)

Releases resources held by the adapter.

After calling [disconnect](#disconnect), subsequent operations may throw
until [connect](#connect) is called again.

#### Returns

`Promise`\<`void`\>

---

### ensureConnected()

> `protected` **ensureConnected**(`methodName`): `void`

Defined in: [adapters/SheetsAdapter.ts:66](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L66)

Guards data-access methods against being called before [connect](#connect).

#### Parameters

##### methodName

`string`

The name of the calling method, included in
the error message for diagnostic clarity.

#### Returns

`void`

#### Throws

If the adapter has not been connected.

---

### ensureSheet()

> `abstract` **ensureSheet**(`sheetName`): `Promise`\<[`SheetInfo`](../interfaces/SheetInfo.md)>>>>>>>\>

Defined in: [adapters/SheetsAdapter.ts:101](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L101)

Ensures a sheet exists, creating it if missing.

When the sheet already exists this is a no-op that returns its
metadata. When it does not exist, a new sheet (tab) is created
with the given title.

#### Parameters

##### sheetName

`string`

The title of the sheet to ensure exists.

#### Returns

`Promise`\<[`SheetInfo`](../interfaces/SheetInfo.md)\>

Metadata for the sheet.

---

### getHeaders()

> `abstract` **getHeaders**(`sheetName?`): `Promise`\<`string`[]\>

Defined in: [adapters/SheetsAdapter.ts:119](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L119)

Reads the header row (row 1) from the specified sheet.

#### Parameters

##### sheetName?

`string`

The sheet to read headers from. When omitted,
the default sheet from [SheetConfig](../interfaces/SheetConfig.md) is used.

#### Returns

`Promise`\<`string`[]\>

An array of header cell values.

---

### getSpreadsheet()

> `abstract` **getSpreadsheet**(): `Promise`\<[`SpreadsheetInfo`](../interfaces/SpreadsheetInfo.md)>>>>>>>\>

Defined in: [adapters/SheetsAdapter.ts:80](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L80)

Retrieves metadata for the spreadsheet, including its title,
URL, and contained sheets.

#### Returns

`Promise`\<[`SpreadsheetInfo`](../interfaces/SpreadsheetInfo.md)\>

The spreadsheet metadata including sheet summaries.

---

### readSheet()

> `abstract` **readSheet**\<`T`>>>>>>>\>(`sheetName?`): `Promise`\<`T`[]\>

Defined in: [adapters/SheetsAdapter.ts:140](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L140)

Reads all data rows from the specified sheet, mapped to objects
using the header row as keys.

#### Type Parameters

##### T

`T` _extends_ `Record`\<`string`, `string`\> = `Record`\<`string`, `string`\>

#### Parameters

##### sheetName?

`string`

The sheet to read from. When omitted, the
default sheet from [SheetConfig](../interfaces/SheetConfig.md) is used.

#### Returns

`Promise`\<`T`[]\>

An array of row objects keyed by header values.

---

### updateRow()

> `abstract` **updateRow**(`rowIndex`, `row`, `sheetName?`): `Promise`\<`void`>>>>>>>\>

Defined in: [adapters/SheetsAdapter.ts:164](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L164)

Updates an existing row by its zero-based data index.

Row index 0 refers to the first data row (the row immediately
after the header row).

#### Parameters

##### rowIndex

`number`

Zero-based index of the row to update.

##### row

`unknown`[]

The new cell values for the row.

##### sheetName?

`string`

The target sheet. When omitted, the default
sheet from [SheetConfig](../interfaces/SheetConfig.md) is used.

#### Returns

`Promise`\<`void`\>

---

### writeHeaders()

> `abstract` **writeHeaders**(`headers`, `sheetName?`): `Promise`\<`void`>>>>>>>\>

Defined in: [adapters/SheetsAdapter.ts:130](https://github.com/luisdlpr/open-sheets-orm/blob/fb9a53e5a13c7a9d7a787ca94047e19ca032cae5/src/adapters/SheetsAdapter.ts#L130)

Writes header values to row 1 of the specified sheet.

Overwrites any existing content in the header row.

#### Parameters

##### headers

`string`[]

The header values to write.

##### sheetName?

`string`

The target sheet. When omitted, the default
sheet from [SheetConfig](../interfaces/SheetConfig.md) is used.

#### Returns

`Promise`\<`void`\>
