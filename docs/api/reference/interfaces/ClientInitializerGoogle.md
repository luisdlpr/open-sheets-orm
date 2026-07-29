Defined in: [types/index.ts:18](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/types/index.ts#L18)

Parameters for initializing the generated client with a Google Sheets provider.

## Properties

### credentials

> **credentials**: `JWTInput`

Defined in: [types/index.ts:20](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/types/index.ts#L20)

Google service account credentials (JWT) or external account credentials.

***

### provider

> **provider**: `"google"`

Defined in: [types/index.ts:29](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/types/index.ts#L29)

The spreadsheet provider identifier. Must be "google".

***

### sheetId

> **sheetId**: `string`

Defined in: [types/index.ts:23](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/types/index.ts#L23)

The unique ID of the target spreadsheet.

***

### sheetName?

> `optional` **sheetName?**: `string`

Defined in: [types/index.ts:26](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/types/index.ts#L26)

The default sheet name to operate on. When omitted, the first sheet is used.
