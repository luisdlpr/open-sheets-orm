> **schema**(`definitions`): [`SchemaMetadata`](../interfaces/SchemaMetadata.md)

Defined in: [schema/schema.ts:29](https://github.com/luisdlpr/open-sheets-orm/blob/7eae837e1b11ed16078e024a017a99fcc7a751f3/src/schema/schema.ts#L29)

Compiles a schema definition into a normalized metadata object.

## Parameters

### definitions

`Record`\<`string`, `Record`\<`string`, [`FieldBuilder`](../classes/FieldBuilder.md)\>\>

Raw model definitions from user code.

## Returns

[`SchemaMetadata`](../interfaces/SchemaMetadata.md)

The compiled schema metadata.

## Throws

When the definition violates validation rules.

## Example

```ts
const meta = schema({
  User: {
    id:    field.string().primaryKey(),
    email: field.string().unique(),
    name:  field.string().optional(),
    age:   field.number().optional().default(0),
  },
});
```
