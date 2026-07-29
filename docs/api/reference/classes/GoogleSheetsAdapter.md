Defined in: [adapters/GoogleSheetsAdapter.ts:34](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L34)

Google Sheets implementation of the [SheetsAdapter](SheetsAdapter.md) contract.

Delegates to four internal services — authentication, spreadsheet
metadata, worksheet management, and row operations — each
responsible for a focused area of the Google Sheets API.

## Example

```ts
import { GoogleSheetsAdapter } from 'open-sheets-orm';

const adapter = new GoogleSheetsAdapter(credentials, 'spreadsheet-id');
await adapter.connect();

const info = await adapter.getSpreadsheet();
const rows = await adapter.readSheet();

await adapter.disconnect();
```

## Extends

- [`SheetsAdapter`](SheetsAdapter.md)

## Constructors

### Constructor

> **new GoogleSheetsAdapter**(`credentials`, `spreadsheetId`, `sheetName?`): `GoogleSheetsAdapter`

Defined in: [adapters/GoogleSheetsAdapter.ts:47](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L47)

#### Parameters

##### credentials

`JWTInput`

Google service account credentials (JWT) or
external account credentials.

##### spreadsheetId

`string`

The unique ID of the target spreadsheet.

##### sheetName?

`string`

The default sheet to operate on. When omitted,
the first sheet is used.

#### Returns

`GoogleSheetsAdapter`

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`constructor`](SheetsAdapter.md#constructor)

## Properties

### \_connected

> `protected` **\_connected**: `boolean` = `false`

Defined in: [adapters/SheetsAdapter.ts:33](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/SheetsAdapter.ts#L33)

Whether the adapter has been successfully connected.

Set to `true` by [connect](SheetsAdapter.md#connect) and `false` by [disconnect](SheetsAdapter.md#disconnect).
Checked in [ensureConnected](SheetsAdapter.md#ensureconnected) before every data operation.

#### Inherited from

[`SheetsAdapter`](SheetsAdapter.md).[`_connected`](SheetsAdapter.md#_connected)

---

### config

> `protected` **config**: [`SheetConfig`](../interfaces/SheetConfig.md)

Defined in: [adapters/SheetsAdapter.ts:25](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/SheetsAdapter.ts#L25)

The spreadsheet configuration for this adapter instance.

#### Inherited from

[`SheetsAdapter`](SheetsAdapter.md).[`config`](SheetsAdapter.md#config)

## Methods

### appendRow()

> **appendRow**(`row`, `sheetName?`): `Promise`\<`void`>\>

Defined in: [adapters/GoogleSheetsAdapter.ts:178](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L178)

Appends a new row after the last existing row in the sheet.

#### Parameters

##### row

`unknown`[]

The cell values for the new row.

##### sheetName?

`string`

The target sheet. Falls back to the sheet
name provided at construction time.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`appendRow`](SheetsAdapter.md#appendrow)

---

### connect()

> **connect**(): `Promise`\<`void`>\>

Defined in: [adapters/GoogleSheetsAdapter.ts:61](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L61)

Authenticates and initializes all internal services.

Must be called before any other adapter method.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`connect`](SheetsAdapter.md#connect)

---

### createSheet()

> **createSheet**(`title`): `Promise`\<[`SheetInfo`](../interfaces/SheetInfo.md)>\>

Defined in: [adapters/GoogleSheetsAdapter.ts:95](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L95)

Creates a new sheet (tab) within the configured spreadsheet.

#### Parameters

##### title

`string`

The title for the new sheet.

#### Returns

`Promise`\<[`SheetInfo`](../interfaces/SheetInfo.md)\>

Metadata for the newly created sheet.

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`createSheet`](SheetsAdapter.md#createsheet)

---

### deleteRow()

> **deleteRow**(`rowIndex`, `sheetName?`): `Promise`\<`void`>\>

Defined in: [adapters/GoogleSheetsAdapter.ts:216](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L216)

Deletes a row by its zero-based data index.

#### Parameters

##### rowIndex

`number`

Zero-based index of the row to delete.

##### sheetName?

`string`

The target sheet. Falls back to the sheet
name provided at construction time.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`deleteRow`](SheetsAdapter.md#deleterow)

---

### deleteSheet()

> **deleteSheet**(`sheetName`): `Promise`\<`void`>\>

Defined in: [adapters/GoogleSheetsAdapter.ts:116](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L116)

Deletes a sheet (tab) from the configured spreadsheet.

#### Parameters

##### sheetName

`string`

The title of the sheet to delete.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`deleteSheet`](SheetsAdapter.md#deletesheet)

---

### disconnect()

> **disconnect**(): `Promise`\<`void`>\>

Defined in: [adapters/GoogleSheetsAdapter.ts:75](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L75)

Releases resources held by this adapter.

The Google Sheets API does not require explicit cleanup.
Service references are preserved for reuse on next connect.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`disconnect`](SheetsAdapter.md#disconnect)

---

### ensureConnected()

> `protected` **ensureConnected**(`methodName`): `void`

Defined in: [adapters/SheetsAdapter.ts:66](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/SheetsAdapter.ts#L66)

Guards data-access methods against being called before [connect](SheetsAdapter.md#connect).

#### Parameters

##### methodName

`string`

The name of the calling method, included in
the error message for diagnostic clarity.

#### Returns

`void`

#### Throws

If the adapter has not been connected.

#### Inherited from

[`SheetsAdapter`](SheetsAdapter.md).[`ensureConnected`](SheetsAdapter.md#ensureconnected)

---

### ensureSheet()

> **ensureSheet**(`sheetName`): `Promise`\<[`SheetInfo`](../interfaces/SheetInfo.md)>\>

Defined in: [adapters/GoogleSheetsAdapter.ts:106](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L106)

Ensures a sheet exists, creating it if missing.

#### Parameters

##### sheetName

`string`

The title of the sheet to ensure exists.

#### Returns

`Promise`\<[`SheetInfo`](../interfaces/SheetInfo.md)\>

Metadata for the sheet.

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`ensureSheet`](SheetsAdapter.md#ensuresheet)

---

### getHeaders()

> **getHeaders**(`sheetName?`): `Promise`\<`string`[]\>

Defined in: [adapters/GoogleSheetsAdapter.ts:128](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L128)

Reads the header row from the specified (or default) sheet.

#### Parameters

##### sheetName?

`string`

The sheet to read from. Falls back to the
sheet name provided at construction time.

#### Returns

`Promise`\<`string`[]\>

An array of header cell values.

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`getHeaders`](SheetsAdapter.md#getheaders)

---

### getSpreadsheet()

> **getSpreadsheet**(): `Promise`\<[`SpreadsheetInfo`](../interfaces/SpreadsheetInfo.md)>\>

Defined in: [adapters/GoogleSheetsAdapter.ts:84](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L84)

Retrieves metadata for the configured spreadsheet.

#### Returns

`Promise`\<[`SpreadsheetInfo`](../interfaces/SpreadsheetInfo.md)\>

The spreadsheet's title, URL, and contained sheet summaries.

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`getSpreadsheet`](SheetsAdapter.md#getspreadsheet)

---

### readSheet()

> **readSheet**\<`T`>\>(`sheetName?`): `Promise`\<`T`[]\>

Defined in: [adapters/GoogleSheetsAdapter.ts:161](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L161)

Reads all data rows from the specified (or default) sheet,
mapped to objects keyed by header values.

#### Type Parameters

##### T

`T` _extends_ `Record`\<`string`, `string`\> = `Record`\<`string`, `string`\>

#### Parameters

##### sheetName?

`string`

The sheet to read from. Falls back to the
sheet name provided at construction time.

#### Returns

`Promise`\<`T`[]\>

An array of row objects keyed by header values.

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`readSheet`](SheetsAdapter.md#readsheet)

---

### updateRow()

> **updateRow**(`rowIndex`, `row`, `sheetName?`): `Promise`\<`void`>\>

Defined in: [adapters/GoogleSheetsAdapter.ts:195](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L195)

Updates an existing row by its zero-based data index.

#### Parameters

##### rowIndex

`number`

Zero-based index of the row to update.

##### row

`unknown`[]

The new cell values for the row.

##### sheetName?

`string`

The target sheet. Falls back to the sheet
name provided at construction time.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`updateRow`](SheetsAdapter.md#updaterow)

---

### writeHeaders()

> **writeHeaders**(`headers`, `sheetName?`): `Promise`\<`void`>\>

Defined in: [adapters/GoogleSheetsAdapter.ts:143](https://github.com/luisdlpr/open-sheets-orm/blob/e7ccd68c235c7f9abf1e18d89bd40374c6228592/src/adapters/GoogleSheetsAdapter.ts#L143)

Writes header values to row 1 of the specified (or default) sheet.

#### Parameters

##### headers

`string`[]

The header values to write.

##### sheetName?

`string`

The target sheet. Falls back to the sheet
name provided at construction time.

#### Returns

`Promise`\<`void`\>

#### Overrides

[`SheetsAdapter`](SheetsAdapter.md).[`writeHeaders`](SheetsAdapter.md#writeheaders)
