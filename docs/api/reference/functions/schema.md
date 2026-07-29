> **schema**(`definitions`): [`SchemaMetadata`](../interfaces/SchemaMetadata.md)

Defined in: [schema/schema.ts:29](https://github.com/luisdlpr/open-sheets-orm/blob/0b3f629e9322205d3fe38495bbe9dfb477a957c5/src/schema/schema.ts#L29)

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
