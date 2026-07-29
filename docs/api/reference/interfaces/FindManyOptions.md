Defined in: [query/types.ts:15](https://github.com/luisdlpr/open-sheets-orm/blob/7eae837e1b11ed16078e024a017a99fcc7a751f3/src/query/types.ts#L15)

Options for the [Database.findMany](../classes/Database.md#findmany) query.

## Properties

### limit?

> `optional` **limit?**: `number`

Defined in: [query/types.ts:23](https://github.com/luisdlpr/open-sheets-orm/blob/7eae837e1b11ed16078e024a017a99fcc7a751f3/src/query/types.ts#L23)

Maximum number of records to return.

***

### skip?

> `optional` **skip?**: `number`

Defined in: [query/types.ts:20](https://github.com/luisdlpr/open-sheets-orm/blob/7eae837e1b11ed16078e024a017a99fcc7a751f3/src/query/types.ts#L20)

Number of records to skip before returning results.

***

### where?

> `optional` **where?**: [`WhereClause`](../type-aliases/WhereClause.md)

Defined in: [query/types.ts:17](https://github.com/luisdlpr/open-sheets-orm/blob/7eae837e1b11ed16078e024a017a99fcc7a751f3/src/query/types.ts#L17)

Field-value pairs to filter records by (all conditions must match).
