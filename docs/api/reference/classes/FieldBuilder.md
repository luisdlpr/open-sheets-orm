Defined in: [schema/FieldBuilder.ts:20](https://github.com/luisdlpr/open-sheets-orm/blob/5a2a5c89c5610683f4e2824d4b521a13ad1211d8/src/schema/FieldBuilder.ts#L20)

Fluent builder for defining a single field's properties.

Consumers should use the `field` factory object rather than
instantiating this class directly.

## Example

```ts
field.string().primaryKey().unique().default('hello').build();
// → { type: 'string', primaryKey: true, unique: true, optional: false, defaultValue: 'hello' }
```

## Constructors

### Constructor

> **new FieldBuilder**(`type`): `FieldBuilder`

Defined in: [schema/FieldBuilder.ts:28](https://github.com/luisdlpr/open-sheets-orm/blob/5a2a5c89c5610683f4e2824d4b521a13ad1211d8/src/schema/FieldBuilder.ts#L28)

#### Parameters

##### type

[`SupportedFieldType`](../type-aliases/SupportedFieldType.md)

#### Returns

`FieldBuilder`

## Methods

### build()

> **build**(): [`FieldMetadata`](../interfaces/FieldMetadata.md)

Defined in: [schema/FieldBuilder.ts:64](https://github.com/luisdlpr/open-sheets-orm/blob/5a2a5c89c5610683f4e2824d4b521a13ad1211d8/src/schema/FieldBuilder.ts#L64)

Compiles the builder into a plain metadata object.

#### Returns

[`FieldMetadata`](../interfaces/FieldMetadata.md)

The field metadata.

---

### default()

> **default**(`value`): `this`

Defined in: [schema/FieldBuilder.ts:53](https://github.com/luisdlpr/open-sheets-orm/blob/5a2a5c89c5610683f4e2824d4b521a13ad1211d8/src/schema/FieldBuilder.ts#L53)

Sets a default value for the field.

#### Parameters

##### value

`unknown`

The default value. Its type must match the field type
(validated by `validateSchema` at compile time).

#### Returns

`this`

---

### optional()

> **optional**(): `this`

Defined in: [schema/FieldBuilder.ts:42](https://github.com/luisdlpr/open-sheets-orm/blob/5a2a5c89c5610683f4e2824d4b521a13ad1211d8/src/schema/FieldBuilder.ts#L42)

#### Returns

`this`

---

### primaryKey()

> **primaryKey**(): `this`

Defined in: [schema/FieldBuilder.ts:32](https://github.com/luisdlpr/open-sheets-orm/blob/5a2a5c89c5610683f4e2824d4b521a13ad1211d8/src/schema/FieldBuilder.ts#L32)

#### Returns

`this`

---

### unique()

> **unique**(): `this`

Defined in: [schema/FieldBuilder.ts:37](https://github.com/luisdlpr/open-sheets-orm/blob/5a2a5c89c5610683f4e2824d4b521a13ad1211d8/src/schema/FieldBuilder.ts#L37)

#### Returns

`this`
